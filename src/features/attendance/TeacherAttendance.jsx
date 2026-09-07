import { useEffect, useMemo, useState } from 'react'
import { listAttendanceFor, saveBulkAttendance, uploadExcuseFile } from '../../api/attendance'
import { listSchedule } from '../../api/schedule'
import { listStudents } from '../../api/students'
import Alert from '../../components/form/Alert'
import Icon from '../../components/Icon'
import { useAuth } from '../../context/useAuth'
import { DAYS } from '../../data/mockSchedule'
import { formatRemaining, getEditability, getEditabilityDeadline } from '../../utils/attendanceTime'
import { getMonday, toIsoDate } from '../../utils/date'
import { getLessonEnd, getLessonStart, getTodayDayKeyInWeek } from '../../utils/publicSchedule'
import DayTabs from '../publicHome/DayTabs'
import WeekNavigator from '../schedule/WeekNavigator'
import ExcuseModal from './ExcuseModal'
import LessonAttendanceEditor from './LessonAttendanceEditor'
import LessonPicker from './LessonPicker'

function formatTime(date) {
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

const BLOCK_MESSAGES = {
  too_early: 'Belgilash dars boshlanishi bilan ochiladi.',
  too_late: "Belgilash dars tugagandan 10 daqiqa o'tib yopiladi — natija (agar bo'lsa) quyida ko'rinadi.",
}

export default function TeacherAttendance() {
  const { currentUser } = useAuth()

  const [allLessons, setAllLessons] = useState([])
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [activeDay, setActiveDay] = useState(
    () => getTodayDayKeyInWeek(getMonday(new Date())) ?? DAYS[0].key,
  )
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [recordsByLesson, setRecordsByLesson] = useState({})
  const [records, setRecords] = useState({})
  const [pendingFiles, setPendingFiles] = useState({})
  const [excuseTarget, setExcuseTarget] = useState(null)
  const [savedBanner, setSavedBanner] = useState(false)
  const [savedBannerDetails, setSavedBannerDetails] = useState('')
  const [saveError, setSaveError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([listSchedule(), listStudents()])
      .then(([lessonsData, studentsData]) => {
        if (cancelled) return
        setAllLessons(lessonsData)
        setStudents(studentsData)
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
  }, [])

  const dayLessons = useMemo(
    () => allLessons.filter((l) => l.teacherId === currentUser.id && l.day === activeDay),
    [allLessons, currentUser.id, activeDay],
  )

  const subjectName = (id) => allLessons.find((l) => l.subjectId === id)?.subjectName ?? '—'
  const groupName = (id) => allLessons.find((l) => l.groupId === id)?.groupName ?? '—'

  const handleWeekChange = (nextWeekStart) => {
    setWeekStart(nextWeekStart)
    setActiveDay(getTodayDayKeyInWeek(nextWeekStart) ?? DAYS[0].key)
    setSelectedLessonId(null)
  }

  const handleDayChange = (nextDay) => {
    setActiveDay(nextDay)
    setSelectedLessonId(null)
  }

  useEffect(() => {
    if (dayLessons.length === 0) return
    let cancelled = false
    Promise.all(
      dayLessons.map((l) => {
        const date = toIsoDate(getLessonStart(weekStart, l.day, l.timeSlot))
        return listAttendanceFor({ scheduleId: l.id, date }).then((data) => [l.id, data])
      }),
    )
      .then((entries) => {
        if (!cancelled) setRecordsByLesson(Object.fromEntries(entries))
      })
      .catch((err) => {
        if (!cancelled) setSaveError(err.message ?? "Davomatni yuklab bo'lmadi")
      })
    return () => {
      cancelled = true
    }
  }, [dayLessons, weekStart])

  const defaultLessonId = useMemo(() => {
    const withState = dayLessons.map((l) => {
      const start = getLessonStart(weekStart, l.day, l.timeSlot)
      const end = getLessonEnd(weekStart, l.day, l.timeSlot)
      return { lesson: l, ...getEditability(start, end, now) }
    })
    const openOne = withState.find((s) => s.editable)
    const savedOne = withState.find((s) => (recordsByLesson[s.lesson.id]?.length ?? 0) > 0)
    return (openOne ?? savedOne ?? withState[0])?.lesson.id ?? null
  }, [dayLessons, weekStart, recordsByLesson, now])

  const effectiveLessonId = selectedLessonId ?? defaultLessonId
  const selectedLesson = dayLessons.find((l) => l.id === effectiveLessonId) ?? null
  const groupStudents = selectedLesson
    ? students.filter((s) => s.groupId === selectedLesson.groupId)
    : []

  const savedRecords = selectedLesson ? (recordsByLesson[selectedLesson.id] ?? []) : []

  // Tanlangan dars almashganda (yoki shu darsning saqlangan davomati hali
  // yuklanmagan holatdan yuklangan holatga o'tganda) `records`ni saqlangan
  // qiymatlardan qayta tiklaydi — bu render vaqtida (effektsiz) amalga
  // oshiriladi, chunki bu React'ning "propga bog'liq state'ni reset qilish"
  // uchun tavsiya etgan usuli (ortiqcha effekt-render aylanishisiz).
  // "loaded"/"pending" holati alohida hisobga olinadi — aks holda sahifa
  // yangilanganda tanlangan dars o'zgarmasa-yu, uning davomati keyinroq
  // (asinxron) kelsa, `records` bo'sh holatda qolib ketardi (davomat 0/N
  // bo'lib ko'rinardi, aslida saqlangan bo'lsa ham).
  const isLoaded = selectedLesson ? Object.hasOwn(recordsByLesson, selectedLesson.id) : false
  const [syncedLessonKey, setSyncedLessonKey] = useState(null)
  const lessonKey = selectedLesson ? `${selectedLesson.id}:${isLoaded ? 'loaded' : 'pending'}` : null
  if (lessonKey !== syncedLessonKey) {
    setSyncedLessonKey(lessonKey)
    setRecords(Object.fromEntries(savedRecords.map((r) => [r.studentId, { status: r.status, reasonText: r.reasonText }])))
    setPendingFiles({})
  }

  const lessonStart = selectedLesson ? getLessonStart(weekStart, selectedLesson.day, selectedLesson.timeSlot) : null
  const lessonEnd = selectedLesson ? getLessonEnd(weekStart, selectedLesson.day, selectedLesson.timeSlot) : null
  const lessonDateIso = lessonStart ? toIsoDate(lessonStart) : null
  const { editable, reason: blockReason } = selectedLesson
    ? getEditability(lessonStart, lessonEnd, now)
    : { editable: false, reason: null }

  const remainingMs =
    editable && lessonEnd ? getEditabilityDeadline(lessonEnd).getTime() - now.getTime() : null

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

      setRecordsByLesson((prev) => ({ ...prev, [selectedLesson.id]: refreshed }))
      setRecords(Object.fromEntries(refreshed.map((r) => [r.studentId, { status: r.status, reasonText: r.reasonText }])))
      setPendingFiles({})
      // Bildirishnomada belgilash oynasi qachon ochilgani/yopilishi va shu
      // vaqtgacha tahrirlash mumkinligi ham ko'rsatiladi.
      const deadline = lessonEnd ? getEditabilityDeadline(lessonEnd) : null
      setSavedBannerDetails(
        lessonStart && deadline
          ? `Ochilish: ${formatTime(lessonStart)} · Yopilish: ${formatTime(deadline)} — shu vaqtgacha tahrirlash mumkin`
          : '',
      )
      setSavedBanner(true)
      setTimeout(() => setSavedBanner(false), 5000)
    } catch (err) {
      setSaveError(err.message ?? 'Saqlashda xatolik yuz berdi')
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
      <WeekNavigator weekStart={weekStart} onChange={handleWeekChange} />

      <DayTabs
        days={DAYS}
        activeDay={activeDay}
        onSelect={handleDayChange}
        todayKey={getTodayDayKeyInWeek(weekStart)}
        weekStart={weekStart}
      />

      {saveError && <Alert variant="error">{saveError}</Alert>}

      {editable && remainingMs !== null && selectedLesson && (
        <div className="flex items-center gap-3 rounded-box border border-warning/40 bg-warning/10 px-4 py-3 shadow-sm">
          <span className="relative flex size-9 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-warning/40" />
            <Icon name="clock" className="relative size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-warning">
              Davomat belgilash uchun {formatRemaining(remainingMs)} qoldi
            </p>
            <p className="truncate text-xs text-base-content/60">
              {selectedLesson.subjectName} · {selectedLesson.groupName}
            </p>
          </div>
        </div>
      )}

      {dayLessons.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-box border border-dashed border-base-300 bg-base-100 py-16 text-center text-base-content/70">
          <Icon name="calendar" className="size-8" />
          <p className="text-sm">Bu kunda darslaringiz yo'q</p>
        </div>
      ) : (
        <>
          <LessonPicker
            lessons={dayLessons}
            selectedId={effectiveLessonId}
            weekStart={weekStart}
            onSelect={setSelectedLessonId}
            subjectName={subjectName}
            groupName={groupName}
            hasSavedFor={(id) => (recordsByLesson[id]?.length ?? 0) > 0}
          />

          {selectedLesson && (
            <LessonAttendanceEditor
              subjectName={selectedLesson.subjectName}
              groupName={selectedLesson.groupName}
              room={selectedLesson.room}
              timeLabel={selectedLesson.timeSlot}
              students={groupStudents}
              records={records}
              editable={editable}
              blockTitle={
                blockReason &&
                (blockReason === 'too_late'
                  ? 'Davomat belgilash vaqti tugagan.'
                  : 'Davomat belgilash vaqti hali kelmagan.')
              }
              blockMessage={BLOCK_MESSAGES[blockReason]}
              savedBanner={savedBanner}
              savedDetails={savedBannerDetails}
              onDismissSaved={() => setSavedBanner(false)}
              onStatusChange={handleStatusChange}
              onMarkAllPresent={handleMarkAllPresent}
              onSave={handleSave}
              isSaving={isSaving}
            />
          )}
        </>
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
