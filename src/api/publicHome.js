import { DAYS, TIME_SLOTS } from '../data/mockSchedule'
import { apiFetch } from './client'

const KEY_BY_WEEKDAY = Object.fromEntries(DAYS.map((d, i) => [i + 1, d.key]))

function timesToSlot(startTime, endTime) {
  const start = startTime?.slice(0, 5)
  const end = endTime?.slice(0, 5)
  return TIME_SLOTS.find((s) => s === `${start} - ${end}`) ?? `${start} - ${end}`
}

function mapLessonFromApi(l) {
  return {
    id: l.id,
    day: KEY_BY_WEEKDAY[l.weekday] ?? 'mon',
    timeSlot: timesToSlot(l.start_time, l.end_time),
    subjectName: l.subject_name,
    groupName: l.group_name,
    teacherName: l.teacher_name,
    room: l.room,
  }
}

// Login talab qilmaydi — kiosk/bosh sahifa uchun.
export async function listPublicSchedule(groupId) {
  const data = await apiFetch('/api/public/schedule/', {
    skipAuth: true,
    params: groupId ? { group: groupId } : undefined,
  })
  return (Array.isArray(data) ? data : []).map(mapLessonFromApi)
}

export async function listPublicGroups() {
  const data = await apiFetch('/api/public/groups/', { skipAuth: true })
  return (Array.isArray(data) ? data : []).map((g) => ({
    id: g.id,
    name: g.name,
    facultyName: g.faculty_name,
    course: g.course,
    academicYear: g.academic_year,
  }))
}

// Login talab qilmaydi. Faqat dars tugagandan keyin to'ladi.
export async function getPublicAttendance(scheduleId, date) {
  const data = await apiFetch('/api/public/attendance/', {
    skipAuth: true,
    params: { schedule: scheduleId, date },
  })
  return (Array.isArray(data) ? data : []).map((a, i) => ({
    id: i,
    studentName: a.student_name,
    status: a.status,
    statusLabel: a.status_display,
  }))
}
