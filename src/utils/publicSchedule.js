import { DAYS, TIME_SLOTS } from '../data/mockSchedule'
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

// Standart 6 ta vaqt oralig'i + haqiqiy ma'lumotlarda uchraydigan, ularga mos
// kelmaydigan har qanday boshqa vaqt oralig'i (masalan 19:00-20:20) — shunda
// hech qanday dars jadval to'ridan "yo'qolib qolmaydi".
export function deriveTimeSlots(lessons) {
  const set = new Set(TIME_SLOTS)
  for (const l of lessons) {
    if (l.timeSlot) set.add(l.timeSlot)
  }
  return [...set].sort((a, b) => a.localeCompare(b))
}

// Agar berilgan hafta joriy hafta bo'lsa va u haftaning bir kuniga to'g'ri kelsa,
// bugungi kun kalitini qaytaradi (aks holda null).
export function getTodayDayKeyInWeek(weekStart, now = new Date()) {
  if (getMonday(now).getTime() !== weekStart.getTime()) return null
  const key = JS_DAY_TO_KEY[now.getDay()]
  return DAYS.some((d) => d.key === key) ? key : null
}
