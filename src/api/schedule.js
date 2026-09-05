import { DAYS, TIME_SLOTS } from '../data/mockSchedule'
import { apiFetch, fetchAllPages } from './client'

const WEEKDAY_BY_KEY = Object.fromEntries(DAYS.map((d, i) => [d.key, i + 1]))
const KEY_BY_WEEKDAY = Object.fromEntries(DAYS.map((d, i) => [i + 1, d.key]))

function slotToTimes(slot) {
  const [start, end] = slot.split(' - ')
  return { start_time: `${start}:00`, end_time: `${end}:00` }
}

function timesToSlot(startTime, endTime) {
  const start = startTime?.slice(0, 5)
  const end = endTime?.slice(0, 5)
  return TIME_SLOTS.find((s) => s === `${start} - ${end}`) ?? `${start} - ${end}`
}

function currentAcademicYear() {
  const now = new Date()
  const y = now.getFullYear()
  return now.getMonth() >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`
}

// `/api/schedule/` ro'yxati "subject"/"group"/"teacher"/"id" (xom FK) qaytaradi,
// "/api/schedule/occurrences/" esa "subject_id"/"group_id"/"teacher_id"/"schedule_id"
// (chunki occurrence Schedule'ning o'zi emas, undan hisoblangan natija) — ikkalasini
// ham qo'llab-quvvatlash uchun fallback bilan o'qiymiz.
function mapLessonFromApi(l) {
  return {
    id: l.id ?? l.schedule_id,
    day: KEY_BY_WEEKDAY[l.weekday] ?? 'mon',
    timeSlot: timesToSlot(l.start_time, l.end_time),
    subjectId: l.subject ?? l.subject_id,
    subjectName: l.subject_name,
    teacherId: l.teacher ?? l.teacher_id,
    teacherName: l.teacher_name,
    groupId: l.group ?? l.group_id,
    groupName: l.group_name,
    lessonType: l.lesson_type,
    lessonTypeDisplay: l.lesson_type_display,
    room: l.room,
    semester: l.semester,
    academicYear: l.academic_year,
  }
}

function lessonToApiBody(input) {
  const { start_time, end_time } = slotToTimes(input.timeSlot)
  return {
    subject: input.subjectId,
    group: input.groupId,
    teacher: input.teacherId,
    // reference_date berilsa backend weekday'ni shundan hisoblaydi va darsni
    // aynan shu bitta sanaga bog'laydi (valid_from=valid_until=reference_date)
    // — haftama-hafta takrorlanmaydi.
    ...(input.date ? { reference_date: input.date } : { weekday: WEEKDAY_BY_KEY[input.day] }),
    start_time,
    end_time,
    lesson_type: input.lessonType,
    room: input.room,
    semester: input.semester ?? '1',
    academic_year: input.academicYear ?? currentAcademicYear(),
  }
}

export async function listSchedule() {
  const raw = await fetchAllPages('/api/schedule/')
  return raw.map(mapLessonFromApi)
}

function mapOccurrenceFromApi(l) {
  return {
    ...mapLessonFromApi(l),
    date: l.date ?? null,
    cancelled: l.cancelled ?? false,
    note: l.note ?? '',
  }
}

// dateFrom/dateTo (YYYY-MM-DD) — shu haftaning haqiqiy sanalariga mos darslar
// (bekor qilingan/o'zgartirilganlarini hisobga olib), takrorlanmasdan.
export async function listScheduleOccurrences(dateFrom, dateTo) {
  const data = await apiFetch('/api/schedule/occurrences/', { params: { date_from: dateFrom, date_to: dateTo } })
  const raw = Array.isArray(data) ? data : (data?.results ?? [])
  return raw.map(mapOccurrenceFromApi)
}

export async function createLesson(input) {
  const data = await apiFetch('/api/schedule/', { method: 'POST', body: lessonToApiBody(input) })
  return mapLessonFromApi(data)
}

export async function updateLesson(id, input) {
  const data = await apiFetch(`/api/schedule/${id}/`, { method: 'PATCH', body: lessonToApiBody(input) })
  return mapLessonFromApi(data)
}

export function deleteLesson(id) {
  return apiFetch(`/api/schedule/${id}/`, { method: 'DELETE' })
}
