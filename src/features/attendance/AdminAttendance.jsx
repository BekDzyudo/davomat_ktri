import { useEffect, useState } from 'react'
import { listAttendanceFor, saveBulkAttendance, uploadExcuseFile } from '../../api/attendance'
import { listGroups } from '../../api/groups'
import { listSchedule } from '../../api/schedule'
import { listStudents } from '../../api/students'
import Alert from '../../components/form/Alert'
import GroupChipRow from '../../components/GroupChipRow'
import Icon from '../../components/Icon'
import { DAYS } from '../../data/mockSchedule'
import { usePersistedGroupId } from '../../hooks/usePersistedGroupId'
import { getLessonStart, getLessonTiming, getTodayDayKeyInWeek } from '../../utils/publicSchedule'
import { getMonday, toIsoDate } from '../../utils/date'
import DayTabs from '../publicHome/DayTabs'
import LessonCard from '../publicHome/LessonCard'
import WeekNavigator from '../schedule/WeekNavigator'
import ExcuseModal from './ExcuseModal'
import LessonAttendanceEditor from './LessonAttendanceEditor'

export default function AdminAttendance() {
  const [allLessons, setAllLessons] = useState([])
  const [groups, setGroups] = useState([])
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [groupId, setGroupId, resolveGroupId] = usePersistedGroupId('attendance')
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [activeDay, setActiveDay] = useState(
    () => getTodayDayKeyInWeek(getMonday(new Date())) ?? DAYS[0].key,
  )
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [records, setRecords] = useState({})
  const [pendingFiles, setPendingFiles] = useState({})
  const [excuseTarget, setExcuseTarget] = useState(null)
  const [savedBanner, setSavedBanner] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([listSchedule(), listGroups(), listStudents()])
      .then(([lessonsData, groupsData, studentsData]) => {
        if (cancelled) return
        setAllLessons(lessonsData)
        setGroups(groupsData)
        setStudents(studentsData)
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
  }, [resolveGroupId])

  const subjectName = (id) => allLessons.find((l) => l.subjectId === id)?.subjectName ?? '—'
  const groupName = (id) => allLessons.find((l) => l.groupId === id)?.groupName ?? '—'
  const teacherName = (id) => allLessons.find((l) => l.teacherId === id)?.teacherName ?? '—'

  const handleGroupChange = (nextGroupId) => {
    setGroupId(nextGroupId)
    setSelectedLessonId(null)
  }

  const handleWeekChange = (nextWeekStart) => {
    setWeekStart(nextWeekStart)
    setActiveDay(getTodayDayKeyInWeek(nextWeekStart) ?? DAYS[0].key)
    setSelectedLessonId(null)
  }

  const handleDayChange = (nextDay) => {
    setActiveDay(nextDay)
    setSelectedLessonId(null)
  }

  const groupLessons = allLessons.filter((l) => l.groupId === groupId)
  const dayLessons = groupLessons.filter((l) => l.day === activeDay)

  const selectedLesson = groupLessons.find((l) => l.id === selectedLessonId) ?? null
  const groupStudents = selectedLesson
    ? students.filter((s) => s.groupId === selectedLesson.groupId)
    : []

  const timing = selectedLesson ? getLessonTiming(selectedLesson, weekStart) : null
  const editable = timing !== null && timing !== 'future'
  const lessonDateIso = selectedLesson
    ? toIsoDate(getLessonStart(weekStart, selectedLesson.day, selectedLesson.timeSlot))
    : null

  useEffect(() => {
    if (!selectedLesson || !lessonDateIso) return
    let cancelled = false
    listAttendanceFor({ scheduleId: selectedLesson.id, date: lessonDateIso })
      .then((data) => {
        if (cancelled) return
        setRecords(Object.fromEntries(data.map((r) => [r.studentId, { status: r.status, reasonText: r.reasonText }])))
        setPendingFiles({})
      })
      .catch((err) => {
        if (!cancelled) setSaveError(err.message ?? "Davomatni yuklab bo'lmadi")
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLesson?.id, lessonDateIso])

  const setStudentRecord = (studentId, record) => {
    if (!selectedLesson) return
    setRecords((prev) => ({ ...prev, [studentId]: record }))
  }

  const handleStatusChange = (student, statusKey) => {
    if (!editable) return
    if (statusKey === 'sababli') {
      setExcuseTarget(student)
      return
    }
    setStudentRecord(student.id, { status: statusKey })
  }

  const handleExcuseConfirm = ({ reason, file }) => {
    setStudentRecord(excuseTarget.id, { status: 'sababli', reasonText: reason })
    if (file) setPendingFiles((prev) => ({ ...prev, [excuseTarget.id]: file }))
    setExcuseTarget(null)
  }

  const handleMarkAllPresent = () => {
    if (!selectedLesson || !editable) return
    setRecords(Object.fromEntries(groupStudents.map((s) => [s.id, { status: 'keldi' }])))
  }

  const handleSave = async () => {
    if (!selectedLesson || !editable || !lessonDateIso) return
    const items = groupStudents
      .filter((s) => records[s.id]?.status)
      .map((s) => ({ studentId: s.id, status: records[s.id].status, reasonText: records[s.id].reasonText }))
    if (items.length === 0) return

    setIsSaving(true)
    setSaveError('')
    try {
      await saveBulkAttendance({ scheduleId: selectedLesson.id, date: lessonDateIso, items })
      let refreshed = await listAttendanceFor({ scheduleId: selectedLesson.id, date: lessonDateIso })

      const filesToUpload = Object.entries(pendingFiles)
      if (filesToUpload.length > 0) {
        for (const [studentId, file] of filesToUpload) {
          const rec = refreshed.find((r) => r.studentId === Number(studentId))
          if (rec) await uploadExcuseFile(rec.id, file)
        }
        refreshed = await listAttendanceFor({ scheduleId: selectedLesson.id, date: lessonDateIso })
      }

      setRecords(
        Object.fromEntries(refreshed.map((r) => [r.studentId, { status: r.status, reasonText: r.reasonText }])),
      )
      setPendingFiles({})
      setSavedBanner(true)
      setTimeout(() => setSavedBanner(false), 4000)
    } catch (err) {
      setSaveError(err.message ?? "Saqlashda xatolik yuz berdi")
    } finally {
      setIsSaving(false)
    }
  }

  if (loadError) return <Alert variant="error">{loadError}</Alert>

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <GroupChipRow groups={groups} selectedGroupId={groupId} onChange={handleGroupChange} />

      <WeekNavigator weekStart={weekStart} onChange={handleWeekChange} />

      <DayTabs
        days={DAYS}
        activeDay={activeDay}
        onSelect={handleDayChange}
        todayKey={getTodayDayKeyInWeek(weekStart)}
        weekStart={weekStart}
      />

      {saveError && <Alert variant="error">{saveError}</Alert>}

      {dayLessons.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-box border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/60">
          <Icon name="calendar" className="size-8" />
          <p className="text-sm">Bu kunda darslar rejalashtirilmagan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {dayLessons.map((lesson) => {
            const lessonTiming = getLessonTiming(lesson, weekStart)
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                timing={lessonTiming}
                subjectName={subjectName}
                groupName={groupName}
                teacherName={teacherName}
                isSelected={lesson.id === selectedLessonId}
                onClick={() => setSelectedLessonId(lesson.id)}
              />
            )
          })}
        </div>
      )}

      {selectedLesson && (
        <LessonAttendanceEditor
          subjectName={selectedLesson.subjectName}
          groupName={selectedLesson.groupName}
          room={selectedLesson.room}
          timeLabel={selectedLesson.timeSlot}
          students={groupStudents}
          records={records}
          editable={editable}
          blockTitle={!editable ? 'Dars hali boshlanmagan.' : undefined}
          blockMessage="Davomatni dars boshlangandan keyin belgilash yoki tahrirlash mumkin."
          savedBanner={savedBanner}
          onStatusChange={handleStatusChange}
          onMarkAllPresent={handleMarkAllPresent}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {excuseTarget && (
        <ExcuseModal
          student={excuseTarget}
          initialReason={records[excuseTarget.id]?.reasonText}
          onClose={() => setExcuseTarget(null)}
          onConfirm={handleExcuseConfirm}
        />
      )}
    </div>
  )
}
