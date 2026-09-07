import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPublicAttendance, listPublicGroups, listPublicSchedule } from '../api/publicHome'
import Icon from '../components/Icon'
import Logo from '../components/Logo'
import { useTheme } from '../context/useTheme'
import AttendancePanel from '../features/publicHome/AttendancePanel'
import WeeklyCalendarGrid from '../features/publicHome/WeeklyCalendarGrid'
import WeekNavigator from '../features/schedule/WeekNavigator'
import { useFullscreen } from '../hooks/useFullscreen'
import { usePersistedGroupId } from '../hooks/usePersistedGroupId'
import { getAccentColor } from '../utils/colors'
import { addDays, getMonday, toIsoDate } from '../utils/date'
import {
  findLastCompletedLesson,
  getLessonStart,
  getLessonTiming,
  getTodayDayKeyInWeek,
} from '../utils/publicSchedule'

const UZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
]

const formatUzDate = (date) => `${date.getDate()}-${UZ_MONTHS[date.getMonth()]}`

const formatTimeWithSeconds = (date) =>
  date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export default function PublicHome() {
  const { isDark, toggleTheme } = useTheme()
  const { isFullscreen, toggle } = useFullscreen()
  const [now, setNow] = useState(() => new Date())
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))

  const [groups, setGroups] = useState([])
  const [groupsError, setGroupsError] = useState('')
  const [selectedGroupId, setSelectedGroupId, resolveGroupId] = usePersistedGroupId('publicHome')

  const [lessons, setLessons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [selectedLessonId, setSelectedLessonId] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [attendanceLoading, setAttendanceLoading] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    let cancelled = false
    listPublicGroups()
      .then((data) => {
        if (cancelled) return
        setGroups(data)
        resolveGroupId(data)
      })
      .catch((err) => {
        if (!cancelled) setGroupsError(err.message ?? "Guruhlarni yuklab bo'lmadi")
      })
    return () => {
      cancelled = true
    }
  }, [resolveGroupId])

  useEffect(() => {
    if (!selectedGroupId) return
    let cancelled = false
    const dateFrom = toIsoDate(weekStart)
    const dateTo = toIsoDate(addDays(weekStart, 4))
    listPublicSchedule(selectedGroupId, dateFrom, dateTo)
      .then((data) => {
        if (cancelled) return
        setLessons(data)
        setSelectedLessonId(findLastCompletedLesson(data.filter((l) => !l.cancelled), weekStart)?.id ?? null)
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
  }, [selectedGroupId, weekStart])

  const todayKey = getTodayDayKeyInWeek(weekStart, now)

  const handleWeekChange = (nextWeekStart) => {
    setWeekStart(nextWeekStart)
    setIsLoading(true)
  }

  const handleGroupChange = (groupId) => {
    setSelectedGroupId(groupId)
    setIsLoading(true)
  }

  const lessonsFor = (dayKey, slot) => lessons.filter((l) => l.day === dayKey && l.timeSlot === slot)

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId) ?? null
  const selectedTiming = selectedLesson ? getLessonTiming(selectedLesson, weekStart, now) : null

  // Tanlangan dars almashganda yuklanish holatini render vaqtida (effektsiz)
  // yoqadi — bu React'ning tavsiya etilgan "propga bog'liq state" naqshi.
  const [syncedAttendanceKey, setSyncedAttendanceKey] = useState(null)
  const attendanceKey = selectedLesson && selectedTiming !== 'future' ? `${selectedLesson.id}-${weekStart.getTime()}` : null
  if (attendanceKey !== syncedAttendanceKey) {
    setSyncedAttendanceKey(attendanceKey)
    if (attendanceKey) setAttendanceLoading(true)
  }

  useEffect(() => {
    if (!selectedLesson || selectedTiming === 'future') return
    let cancelled = false
    const dateIso = selectedLesson.date ?? toIsoDate(getLessonStart(weekStart, selectedLesson.day, selectedLesson.timeSlot))
    getPublicAttendance(selectedLesson.id, dateIso)
      .then((data) => {
        if (!cancelled) setAttendance(data)
      })
      .catch(() => {
        if (!cancelled) setAttendance([])
      })
      .finally(() => {
        if (!cancelled) setAttendanceLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedLesson, selectedTiming, weekStart])

  return (
    <div className="flex min-h-screen flex-col bg-base-200">
      <div className="h-1.5 shrink-0 bg-linear-to-r from-primary via-secondary to-accent" />
      <header className="shrink-0 border-b border-base-300 bg-base-100 shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:portrait:py-5">
          <div className="flex min-w-0 items-center gap-3">
            <Logo className="h-9 w-9 shrink-0 sm:portrait:h-12 sm:portrait:w-12" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-base-content sm:portrait:text-lg">
                Kasbiy ta'limni rivojlantirish instituti
              </p>
              <p className="hidden text-xs text-base-content/50 sm:block">
                Dars jadvali va davomat monitoringi
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className="flex size-9 items-center justify-center rounded-full border border-success/30 bg-success/10 sm:portrait:size-11"
              title="Jonli monitoring faol"
              aria-label="Jonli monitoring faol"
            >
              <span className="relative flex size-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-success" />
              </span>
            </span>
            <span className="hidden text-sm font-medium tabular-nums text-base-content/60 md:block">
              {formatUzDate(now)} · {formatTimeWithSeconds(now)}
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="group flex size-10 items-center justify-center rounded-box border border-base-300 bg-base-100 text-base-content/60 shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-base-200 hover:text-primary sm:portrait:size-12"
              aria-label={isDark ? "Yorug' rejim" : 'Tungi rejim'}
            >
              <Icon
                name={isDark ? 'sun' : 'moon'}
                className="size-5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110 sm:portrait:size-6"
              />
            </button>
            <button
              type="button"
              onClick={toggle}
              className="flex size-10 items-center justify-center rounded-box border border-base-300 bg-base-100 text-base-content/60 shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-base-200 hover:text-primary sm:portrait:size-12"
              aria-label={isFullscreen ? "To'liq ekrandan chiqish" : "To'liq ekran"}
            >
              <Icon name={isFullscreen ? 'minimize' : 'maximize'} className="size-5 sm:portrait:size-6" />
            </button>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-box bg-linear-to-r from-primary to-secondary px-4 py-2.5 text-sm font-semibold text-primary-content shadow-sm transition-all duration-200 hover:shadow-lg hover:brightness-105 active:scale-95 sm:portrait:px-5 sm:portrait:py-3 sm:portrait:text-base"
            >
              <Icon name="login" className="size-4 sm:portrait:size-5" />
              Kirish
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col p-4 pb-8 sm:p-6 sm:portrait:p-5">
        <div className="mb-3 shrink-0 sm:portrait:mb-4">
          <h1 className="text-xl font-black text-base-content sm:text-3xl sm:portrait:text-4xl">
            Dars jadvali va davomat monitoringi
          </h1>
        </div>

        {groupsError && <p className="mb-3 shrink-0 text-sm text-error">{groupsError}</p>}

        {groups.length > 0 && (
          <div className="mb-3 flex shrink-0 gap-2 overflow-x-auto pb-1">
            {groups.map((g) => {
              const accent = getAccentColor(g.id)
              const isSelected = g.id === selectedGroupId
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleGroupChange(g.id)}
                  className={[
                    'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm sm:portrait:px-5 sm:portrait:py-2.5 sm:portrait:text-base',
                    isSelected
                      ? `${accent.solid} border-transparent text-white shadow-sm`
                      : 'border-base-300 bg-base-100 text-base-content/70 hover:border-base-content/20',
                  ].join(' ')}
                >
                  <span className={`size-2 shrink-0 rounded-full ${isSelected ? 'bg-white' : accent.solid}`} />
                  {g.name}
                </button>
              )
            })}
          </div>
        )}

        {loadError ? (
          <div className="flex min-h-64 items-center justify-center text-center text-sm text-error">
            {loadError}
          </div>
        ) : isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-2">
                <WeekNavigator weekStart={weekStart} onChange={handleWeekChange} />
                <WeeklyCalendarGrid
                  lessons={lessons}
                  lessonsFor={lessonsFor}
                  getTiming={(lesson) => getLessonTiming(lesson, weekStart, now)}
                  selectedLessonId={selectedLessonId}
                  onSelectLesson={setSelectedLessonId}
                  weekStart={weekStart}
                  todayKey={todayKey}
                />
              </div>

              <div className="min-w-0 sm:max-w-md sm:flex-1">
                <AttendancePanel
                  lesson={selectedLesson}
                  timing={selectedTiming}
                  attendance={attendance}
                  isLoading={attendanceLoading}
                />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-3xl bg-linear-to-r from-primary/10 via-secondary/10 to-accent/10 p-4 portrait:p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-content shadow-sm portrait:size-12">
                <Icon name="lightbulb" className="size-5 portrait:size-6" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-base-content portrait:text-base">Eslatma</p>
                <p className="truncate text-xs text-base-content/60 portrait:text-sm">
                  Darslarni o'z vaqtida boshlang va davomatni aniq monitoring qiling.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
