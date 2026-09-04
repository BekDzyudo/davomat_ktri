import { useCallback, useEffect, useState } from 'react'
import { listGroups } from '../api/groups'
import { createLesson, deleteLesson, listSchedule, listScheduleOccurrences, updateLesson } from '../api/schedule'
import { listSubjects } from '../api/subjects'
import { listUsers } from '../api/users'
import ConfirmDialog from '../components/ConfirmDialog'
import Alert from '../components/form/Alert'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../data/roles'
import LessonFormModal from '../features/schedule/LessonFormModal'
import ScheduleGrid from '../features/schedule/ScheduleGrid'
import WeekNavigator from '../features/schedule/WeekNavigator'
import { getAccentColor } from '../utils/colors'
import { addDays, getMonday, toIsoDate } from '../utils/date'

export default function Schedule() {
  const { currentUser } = useAuth()
  const [lessons, setLessons] = useState([])
  const [occurrences, setOccurrences] = useState([])
  const [groups, setGroups] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [modalState, setModalState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionError, setActionError] = useState('')

  const canEdit = [ROLES.SUPERADMIN, ROLES.ADMIN].includes(currentUser.role)
  const isTeacherView = currentUser.role === ROLES.OQITUVCHI

  useEffect(() => {
    let cancelled = false
    Promise.all([
      listSchedule(),
      listGroups().catch(() => []),
      canEdit ? listSubjects().catch(() => []) : Promise.resolve([]),
      canEdit ? listUsers().catch(() => []) : Promise.resolve([]),
    ])
      .then(([lessonsData, groupsData, subjectsData, usersData]) => {
        if (cancelled) return
        setLessons(lessonsData)
        setGroups(groupsData)
        setSubjects(subjectsData)
        setTeachers(usersData.filter((u) => u.role === ROLES.OQITUVCHI))
        setSelectedGroupId((prev) => prev ?? groupsData[0]?.id ?? null)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Ma'lumotlarni yuklab bo'lmadi")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [canEdit])

  // Jadval to'ri haftaning haqiqiy sanalariga mos darslarni (bekor
  // qilingan/o'zgartirilganlarini hisobga olib) ko'rsatadi — shuning uchun
  // hafta almashganda qayta so'raladi, oldingi haftadagi ma'lumot qolib
  // ketmaydi.
  const loadOccurrences = useCallback(() => {
    const dateFrom = toIsoDate(weekStart)
    const dateTo = toIsoDate(addDays(weekStart, 4))
    return listScheduleOccurrences(dateFrom, dateTo).then(setOccurrences)
  }, [weekStart])

  useEffect(() => {
    let cancelled = false
    loadOccurrences().catch((err) => {
      if (!cancelled) setLoadError(err.message ?? "Ma'lumotlarni yuklab bo'lmadi")
    })
    return () => {
      cancelled = true
    }
  }, [loadOccurrences])

  const visibleOccurrences = isTeacherView
    ? occurrences.filter((l) => l.teacherId === currentUser.id)
    : occurrences.filter((l) => l.groupId === selectedGroupId)

  const getCellLesson = (day, timeSlot) =>
    visibleOccurrences.find((l) => l.day === day && l.timeSlot === timeSlot) ?? null

  const renderCell = (lesson) => {
    if (lesson.cancelled) {
      return (
        <div
          title={lesson.note || 'Dars bekor qilingan'}
          className="flex h-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-error/30 bg-error/5 p-2.5 text-center"
        >
          <p className="line-clamp-2 text-[13px] font-bold leading-tight text-error/60 line-through">
            {lesson.subjectName}
          </p>
          <span className="text-[10px] font-semibold text-error/60">Bekor qilingan</span>
        </div>
      )
    }

    const personName = isTeacherView ? lesson.groupName : lesson.teacherName
    const accent = getAccentColor(personName)

    return (
      <div
        className={`group/cell relative flex h-full flex-col gap-1.5 rounded-xl border-l-4 bg-base-100 p-2.5 shadow-sm ring-1 ring-base-300 ${accent.borderL}`}
      >
        {canEdit && (
          <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-base-200/80 text-base-content/50 opacity-0 transition-opacity group-hover/cell:opacity-100">
            <Icon name="pencil" className="size-3" />
          </span>
        )}
        <p className="line-clamp-2 pr-4 text-[13px] font-bold leading-tight text-base-content">
          {lesson.subjectName}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] leading-tight text-base-content/60">
          <Icon name="mapPin" className="size-3 shrink-0" />
          <span className="truncate">{lesson.room}</span>
        </div>
        <span
          className={`mt-auto inline-flex w-fit max-w-full items-center truncate rounded-full px-2 py-1 text-[10px] font-bold ${accent.bg} ${accent.text}`}
        >
          {personName}
        </span>
      </div>
    )
  }

  const handleCellClick = (day, timeSlot, lesson, date) => {
    if (!canEdit || lesson?.cancelled) return
    setModalState({ lesson, day, timeSlot, date })
  }

  const handleSubmit = async (data) => {
    if (data.id) {
      const updated = await updateLesson(data.id, data)
      setLessons((prev) => prev.map((l) => (l.id === updated.id ? updated : l)))
    } else {
      const created = await createLesson(data)
      setLessons((prev) => [...prev, created])
    }
    await loadOccurrences()
    setModalState(null)
  }

  const handleDeleteRequest = (lesson) => {
    setModalState(null)
    setDeleteTarget(lesson)
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteLesson(deleteTarget.id)
      setLessons((prev) => prev.filter((l) => l.id !== deleteTarget.id))
      await loadOccurrences()
      setDeleteTarget(null)
    } catch (err) {
      setActionError(err.message ?? "O'chirishda xatolik yuz berdi")
      setDeleteTarget(null)
    }
  }

  if (loadError) {
    return (
      <div>
        <PageHeader title="Dars jadvali" />
        <Alert variant="error">{loadError}</Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Dars jadvali" description={isTeacherView ? "O'zingizga biriktirilgan darslar" : undefined} />

      {!isTeacherView && (
        <div className="mb-4 flex flex-wrap gap-2">
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedGroupId(g.id)}
              className={[
                'rounded-box border px-4 py-2 text-sm font-medium transition-all duration-200',
                g.id === selectedGroupId
                  ? 'border-primary bg-primary text-primary-content shadow-sm'
                  : 'border-base-300 bg-base-100 text-base-content/70 hover:border-primary/40 hover:text-primary',
              ].join(' ')}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      {actionError && (
        <div className="mb-4">
          <Alert variant="error">{actionError}</Alert>
        </div>
      )}

      <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />

      <ScheduleGrid
        lessons={visibleOccurrences}
        getCellLesson={getCellLesson}
        renderCell={renderCell}
        onCellClick={handleCellClick}
        editable={canEdit}
        weekStart={weekStart}
      />

      {modalState && (
        <LessonFormModal
          open
          lesson={modalState.lesson}
          defaultDay={modalState.day}
          defaultTimeSlot={modalState.timeSlot}
          defaultGroupId={selectedGroupId}
          weekStart={weekStart}
          lessons={lessons}
          groups={groups}
          subjects={subjects}
          teachers={teachers}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
          onDeleteRequest={handleDeleteRequest}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Darsni o'chirish"
        description={deleteTarget ? `${deleteTarget.subjectName} darsi o'chirilsinmi?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
