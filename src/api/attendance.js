import { apiFetch, fetchAllPages } from './client'

function mapAttendanceFromApi(a) {
  return {
    id: a.id,
    studentId: a.student,
    studentName: a.student_name,
    scheduleId: a.schedule,
    date: a.date,
    status: a.status,
    reasonText: a.reason_text,
    reasonFile: a.reason_file,
    markedBy: a.marked_by,
    markedByName: a.marked_by_name,
    markedAt: a.marked_at,
    updatedAt: a.updated_at,
    editLogs: (a.edit_logs ?? []).map((l) => ({
      id: l.id,
      changedByName: l.changed_by_name,
      oldStatus: l.old_status,
      newStatus: l.new_status,
      changedAt: l.changed_at,
    })),
  }
}

// Eslatma: /api/attendance/ ro'yxati hujjatlarga ko'ra faqat "page" bilan
// sahifalanadi (schedule/date/student bo'yicha filtr Swagger'da ko'rinmaydi).
// Shu sabab bu yerda filtr parametri "optimistik" tarzda yuboriladi (backend
// qo'llab-quvvatlasa tezroq ishlaydi), lekin natija baribir mijoz tomonda
// ham qat'iy filtrlanadi — noto'g'ri/be'lgisiz ma'lumot ko'rsatilmasligi
// kafolatlanadi.
export async function listAttendanceFor({ scheduleId, date }) {
  const raw = await fetchAllPages('/api/attendance/', { schedule: scheduleId, date })
  return raw.map(mapAttendanceFromApi).filter((a) => a.scheduleId === scheduleId && a.date === date)
}

export async function listAttendanceForStudent(studentId) {
  const raw = await fetchAllPages('/api/attendance/', { student: studentId })
  return raw.map(mapAttendanceFromApi).filter((a) => a.studentId === studentId)
}

export function saveBulkAttendance({ scheduleId, date, items }) {
  return apiFetch('/api/attendance/bulk/', {
    method: 'POST',
    body: {
      schedule: scheduleId,
      date,
      items: items.map((it) => ({
        student: it.studentId,
        status: it.status,
        reason_text: it.reasonText ?? '',
      })),
    },
  })
}

export async function uploadExcuseFile(attendanceId, file) {
  const formData = new FormData()
  formData.append('reason_file', file)
  const data = await apiFetch(`/api/attendance/${attendanceId}/`, { method: 'PATCH', formData })
  return mapAttendanceFromApi(data)
}

function mapCalendarDayFromApi(day) {
  return {
    status: day.status,
    entryTime: day.entry_time,
    exitTime: day.exit_time,
    entryPhoto: day.entry_photo,
    exitPhoto: day.exit_photo,
    // "Umumiy manzara surati" — admin paneldagi kabi to'liq kadr (kattaroq
    // ko'rinish uchun, kesilgan yuz suratidan farqli).
    entryScenePhoto: day.entry_scene_photo,
    exitScenePhoto: day.exit_scene_photo,
    events: (day.events ?? []).map((e) => ({
      time: e.time,
      direction: e.direction, // 'entry' | 'exit'
      photo: e.photo,
      scenePhoto: e.scene_photo,
    })),
  }
}

/**
 * Bitta talabaning bir oylik davomat taqvimi — `AttendanceCalendarModal` uchun.
 * `{"YYYY-MM-DD": {status, entryTime, exitTime, entryPhoto, exitPhoto, events}}`
 * lug'atini qaytaradi — Attendance yozuvi yo'q kunlar (dam olish/kelajak/dars
 * yo'q) natijada UMUMAN bo'lmaydi (frontend buni "status: null" deb talqin qiladi).
 */
export async function getStudentCalendar(studentId, year, month) {
  const data = await apiFetch('/api/attendance/calendar/', { params: { student: studentId, year, month } })
  return Object.fromEntries(Object.entries(data.days ?? {}).map(([iso, day]) => [iso, mapCalendarDayFromApi(day)]))
}

/**
 * Bitta xodimning bir oylik davomat taqvimi — `getStudentCalendar` bilan bir
 * xil shaklda, lekin xodim uchun (dars jadvaliga emas, fiksirlangan 09:00–18:00
 * ish vaqtiga bog'liq holat hisoblanadi).
 */
export async function getStaffCalendar(staffId, year, month) {
  const data = await apiFetch('/api/attendance/calendar/', { params: { staff: staffId, year, month } })
  return Object.fromEntries(Object.entries(data.days ?? {}).map(([iso, day]) => [iso, mapCalendarDayFromApi(day)]))
}
