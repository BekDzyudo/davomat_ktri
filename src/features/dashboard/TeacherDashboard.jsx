import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import { getEditability } from '../../utils/attendanceTime'

function isMarked(lesson) {
  return Boolean(lesson.is_marked ?? lesson.attendance_marked ?? lesson.marked ?? false)
}

// `today_lessons` faqat "HH:MM:SS" vaqtini beradi (sanasiz, chunki u doim
// bugungi kun) — shu bugungi sanaga bog'lab, haqiqiy Date obyektiga aylantiradi.
function timeToday(value) {
  if (!value) return null
  const [h, m] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(h, m, 0, 0)
  return date
}

// Dars boshlanishi bilan ochiladi, tugagandan 10 daqiqa o'tib yopiladi
// (`getEditability` — davomat sahifasidagi bilan bir xil qoida).
function isCurrentlyMarkable(lesson, now) {
  const start = timeToday(lesson.start_time)
  const end = timeToday(lesson.end_time)
  return start && end ? getEditability(start, end, false, now).editable : false
}

function lessonLabel(lesson) {
  return lesson.subject_name ?? lesson.subject ?? '—'
}

function lessonGroup(lesson) {
  return lesson.group_name ?? lesson.group ?? ''
}

function lessonTime(lesson) {
  if (lesson.start_time && lesson.end_time) {
    return `${lesson.start_time.slice(0, 5)} - ${lesson.end_time.slice(0, 5)}`
  }
  return lesson.time_slot ?? ''
}

export default function TeacherDashboard({ data }) {
  const navigate = useNavigate()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const todaysLessons = data?.today_lessons ?? []
  // Faqat hozir haqiqatan ham belgilash mumkin bo'lgan (darsdan 15 daqiqa
  // oldindan 1 soat o'tguncha) va hali belgilanmagan darslar ko'rsatiladi —
  // ertangi/kechroqdagi yoki muddati o'tib ketgan darslar bu yerda chiqmaydi.
  const unmarkedLessons = todaysLessons.filter((l) => !isMarked(l) && isCurrentlyMarkable(l, now))
  const markedLessons = todaysLessons.filter(isMarked).length
  const nextLesson = todaysLessons.find((lesson) => {
    const start = timeToday(lesson.start_time)
    return start && start > now
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon name="calendar" className="size-4" />
          </span>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-base-content/45">Bugungi darslar</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-base-content">{todaysLessons.length}</p>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <span className="flex size-9 items-center justify-center rounded-xl bg-success/10 text-success">
            <Icon name="check" className="size-4" />
          </span>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-base-content/45">Yakunlangan</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-success">{markedLessons}</p>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <span className="flex size-9 items-center justify-center rounded-xl bg-warning/10 text-warning">
            <Icon name="alertTriangle" className="size-4" />
          </span>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-base-content/45">Kutilayotgan</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-warning">{unmarkedLessons.length}</p>
        </div>
        <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm">
          <span className="flex size-9 items-center justify-center rounded-xl bg-info/10 text-info">
            <Icon name="clock" className="size-4" />
          </span>
          <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-base-content/45">Keyingi dars</p>
          <p className="mt-1 truncate text-sm font-black text-base-content">
            {nextLesson ? lessonTime(nextLesson).split(' - ')[0] : '—'}
          </p>
        </div>
      </div>

      {unmarkedLessons.length > 0 && (
        <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-black text-warning">
            <Icon name="alertTriangle" className="size-4 shrink-0" />
            Hali belgilanmagan davomat ({unmarkedLessons.length})
            </div>
            <span className="rounded-full bg-warning/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-warning">Amal kerak</span>
          </div>
          <ul className="flex flex-col gap-2">
            {unmarkedLessons.map((lesson, i) => (
              <li
                key={lesson.id ?? lesson.schedule_id ?? i}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/20 bg-base-100 px-3.5 py-3 shadow-sm"
              >
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <Icon name="clock" className="size-4 shrink-0 text-warning" />
                  <span className="truncate font-medium text-base-content">{lessonLabel(lesson)}</span>
                  <span className="shrink-0 text-base-content/50">
                    {lessonGroup(lesson)} · {lessonTime(lesson)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/attendance')}
                  className="shrink-0 text-xs font-medium text-primary hover:underline"
                >
                  Davomatga o'tish
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-base-300 bg-base-100 p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-base-content">Bugungi darslar</h2>
            <p className="mt-1 text-xs text-base-content/45">Darsni tanlab davomatni boshqarishingiz mumkin</p>
          </div>
          <button type="button" onClick={() => navigate('/schedule')} className="text-xs font-semibold text-primary hover:underline">
            Jadvalni ko'rish
          </button>
        </div>
        {todaysLessons.length === 0 ? (
          <p className="text-sm text-base-content/50">Bugun darslaringiz yo'q</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todaysLessons.map((lesson, i) => (
              <button
                key={lesson.id ?? lesson.schedule_id ?? i}
                type="button"
                onClick={() => navigate('/attendance')}
                className="group flex flex-wrap items-center justify-between gap-3 rounded-xl border border-base-300 bg-base-100 px-4 py-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon name="clock" className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-base-content">{lessonLabel(lesson)}</span>
                    <span className="mt-0.5 block truncate text-xs text-base-content/50">
                      {lessonGroup(lesson)} · {lessonTime(lesson)}
                    </span>
                  </span>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    isMarked(lesson) ? 'bg-success/10 text-success' : 'bg-base-300 text-base-content/50'
                  }`}
                >
                  {isMarked(lesson) ? 'Belgilangan' : 'Belgilanmagan'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
