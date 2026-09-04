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
