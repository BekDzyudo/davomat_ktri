import { useCallback, useEffect, useState } from 'react'
import { listGroups } from '../api/groups'
import { createLesson, deleteLesson, listScheduleOccurrences, updateLesson } from '../api/schedule'
import { createSubject, listSubjects } from '../api/subjects'
import { listUsers } from '../api/users'
import ConfirmDialog from '../components/ConfirmDialog'
import Alert from '../components/form/Alert'
import GroupChipRow from '../components/GroupChipRow'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../data/roles'
import LessonFormModal from '../features/schedule/LessonFormModal'
import ScheduleGrid from '../features/schedule/ScheduleGrid'
import WeekNavigator from '../features/schedule/WeekNavigator'
import { getAccentColor } from '../utils/colors'
import { addDays, getMonday, toIsoDate } from '../utils/date'
import { usePersistedGroupId } from '../hooks/usePersistedGroupId'

export default function Schedule() {
  const { currentUser } = useAuth()
  const [occurrences, setOccurrences] = useState([])
  const [groups, setGroups] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedGroupId, setSelectedGroupId, resolveGroupId] = usePersistedGroupId('schedule')
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [modalState, setModalState] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [actionError, setActionError] = useState('')

  const canEdit = [ROLES.SUPERADMIN, ROLES.ADMIN].includes(currentUser.role)
  const isTeacherView = currentUser.role === ROLES.OQITUVCHI

  useEffect(() => {
    let cancelled = false
    Promise.all([
      listGroups().catch(() => []),
      canEdit ? listSubjects().catch(() => []) : Promise.resolve([]),
      canEdit ? listUsers().catch(() => []) : Promise.resolve([]),
    ])
      .then(([groupsData, subjectsData, usersData]) => {
        if (cancelled) return
        setGroups(groupsData)
        setSubjects(subjectsData)
        setTeachers(usersData.filter((u) => u.role === ROLES.OQITUVCHI))
        resolveGroupId(groupsData)
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
  }, [canEdit, resolveGroupId])

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
          <span className="absolute right-1.5 top-1.5 flex size-5 items-center justify-center rounded-full bg-base-200/80 text-base-content/70 opacity-0 transition-opacity group-hover/cell:opacity-100">
            <Icon name="pencil" className="size-3" />
          </span>
        )}
        <p className="line-clamp-2 pr-4 text-[13px] font-bold leading-tight text-base-content">
          {lesson.subjectName}
        </p>
        <div className="flex items-center gap-1.5 text-[11px] leading-tight text-base-content/60">
          <Icon name="mapPin" className="size-3 shrink-0" />
          <span className="truncate">{lesson.room}</span>
          {lesson.lessonTypeDisplay && (
            <>
              <span className="text-base-content/30">·</span>
              <span className="shrink-0">{lesson.lessonTypeDisplay}</span>
            </>
          )}
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
      await updateLesson(data.id, data)
    } else {
      await createLesson(data)
    }
    await loadOccurrences()
    setModalState(null)
  }

  const handleCreateSubject = async (data) => {
    const created = await createSubject(data)
    setSubjects((prev) => [...prev, created])
    return created
  }

  const handleDeleteRequest = (lesson) => {
    setModalState(null)
    setDeleteTarget(lesson)
  }

  const handleDelete = async () => {
    setActionError('')
    try {
      await deleteLesson(deleteTarget.id)
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
        <PageHeader title="Dars jadvali" icon="calendar" />
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
      <PageHeader title="Dars jadvali" icon="calendar" description={isTeacherView ? "O'zingizga biriktirilgan darslar" : undefined} />

      {!isTeacherView && (
        <GroupChipRow groups={groups} selectedGroupId={selectedGroupId} onChange={setSelectedGroupId} />
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
          // To'qnashuv tekshiruvi uchun aynan shu haftaning haqiqiy sanalariga mos
          // darslar beriladi (`lessons` emas — u butun semestr bo'ylab takrorlanuvchi
          // shablon, sana/hafta farqini bilmaydi va yolg'on to'qnashuv ko'rsatib yuboradi).
          lessons={occurrences.filter((o) => !o.cancelled)}
          groups={groups}
          subjects={subjects}
          teachers={teachers}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
          onDeleteRequest={handleDeleteRequest}
          onCreateSubject={handleCreateSubject}
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
