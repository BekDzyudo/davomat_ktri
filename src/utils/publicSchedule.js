import { DAYS, SCHEDULE_ROWS } from '../data/mockSchedule'
import { addDays, getMonday } from './date'

const DAY_OFFSETS = Object.fromEntries(DAYS.map((d, i) => [d.key, i]))
const JS_DAY_TO_KEY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function timeSlotToMinutes(part) {
  const [h, m] = part.split(':').map(Number)
  return h * 60 + m
}

export function getLessonStart(weekStart, dayKey, timeSlot) {
  const [start] = timeSlot.split(' - ')
  const date = addDays(weekStart, DAY_OFFSETS[dayKey] ?? 0)
  const minutes = timeSlotToMinutes(start)
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return date
}

export function getLessonEnd(weekStart, dayKey, timeSlot) {
  const [, end] = timeSlot.split(' - ')
  const date = addDays(weekStart, DAY_OFFSETS[dayKey] ?? 0)
  const minutes = timeSlotToMinutes(end)
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)
  return date
}

// 'future'    — hali boshlanmagan, faqat jadval ma'lumoti ko'rsatiladi
// 'ongoing'   — hozir davom etmoqda, davomat ko'rish mumkin
// 'completed' — tugagan, davomat ko'rish mumkin
export function getLessonTiming(lesson, weekStart, now = new Date()) {
  const start = getLessonStart(weekStart, lesson.day, lesson.timeSlot)
  const end = getLessonEnd(weekStart, lesson.day, lesson.timeSlot)

  if (now < start) return 'future'
  if (now <= end) return 'ongoing'
  return 'completed'
}

export function isLessonSelectable(lesson, weekStart, now = new Date()) {
  return getLessonTiming(lesson, weekStart, now) !== 'future'
}

// Berilgan hafta ichida eng so'nggi tugagan darsni topadi (default tanlov uchun).
export function findLastCompletedLesson(lessons, weekStart, now = new Date()) {
  let best = null
  let bestEnd = null

  for (const lesson of lessons) {
    const end = getLessonEnd(weekStart, lesson.day, lesson.timeSlot)
    if (end <= now && (!bestEnd || end > bestEnd)) {
      best = lesson
      bestEnd = end
    }
  }

  return best
}

// SCHEDULE_ROWS (smena+para bo'yicha qatorlar) + haqiqiy ma'lumotlarda
// uchraydigan, ularga mos kelmaydigan har qanday boshqa vaqt oralig'i
// (masalan eski jadvaldan qolgan dars) — shunda hech qanday dars jadval
// to'ridan "yo'qolib qolmaydi", faqat "label"siz alohida qator sifatida chiqadi.
export function deriveScheduleRows(lessons) {
  const knownSlots = new Set(SCHEDULE_ROWS.map((r) => r.timeSlot))
  const legacySlots = new Set()
  for (const l of lessons) {
    if (l.timeSlot && !knownSlots.has(l.timeSlot)) legacySlots.add(l.timeSlot)
  }
  const legacyRows = [...legacySlots].map((timeSlot) => ({ key: timeSlot, label: null, timeSlot }))

  return [...SCHEDULE_ROWS, ...legacyRows].sort(
    (a, b) => timeSlotToMinutes(a.timeSlot.split(' - ')[0]) - timeSlotToMinutes(b.timeSlot.split(' - ')[0]),
  )
}

// Agar berilgan hafta joriy hafta bo'lsa va u haftaning bir kuniga to'g'ri kelsa,
// bugungi kun kalitini qaytaradi (aks holda null).
export function getTodayDayKeyInWeek(weekStart, now = new Date()) {
  if (getMonday(now).getTime() !== weekStart.getTime()) return null
  const key = JS_DAY_TO_KEY[now.getDay()]
  return DAYS.some((d) => d.key === key) ? key : null
}
