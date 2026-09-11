import { apiFetch } from './client'

function cleanParams(params = {}) {
  const out = {}
  if (params.academicYear) out.academic_year = params.academicYear
  if (params.dateFrom) out.date_from = params.dateFrom
  if (params.dateTo) out.date_to = params.dateTo
  if (params.group) out.group = params.group
  if (params.schedule) out.schedule = params.schedule
  if (params.semester) out.semester = params.semester
  if (params.student) out.student = params.student
  if (params.subject) out.subject = params.subject
  if (params.granularity) out.granularity = params.granularity
  return out
}

export function getDashboard(params) {
  return apiFetch('/api/reports/dashboard/', { params: cleanParams(params) })
}

export function getSummary(params) {
  return apiFetch('/api/reports/summary/', { params: cleanParams(params) })
}

export function getTimeseries(params) {
  return apiFetch('/api/reports/timeseries/', { params: cleanParams(params) })
}

/**
 * "Dars qoldirganlar" sahifasi uchun — chegaradan KO'P para SABABSIZ qoldirgan
 * talabalar ro'yxati.
 *
 * `threshold` — sababsiz qoldirilgan paralar chegarasi (standart 9, ya'ni 10 va
 * undan ortiq qoldirgan talaba ro'yxatga tushadi). `academicYear` berilmasa,
 * backend joriy o'quv yilini o'zi hisoblaydi.
 *
 * Javob: {academic_year, threshold, count, students: [...]}.
 */
export function getMissedLessons({ threshold, academicYear, group } = {}) {
  return apiFetch('/api/reports/missed-lessons/', {
    params: {
      threshold,
      academic_year: academicYear,
      group,
    },
  })
}

// Login talab qilmaydi — kiosk/bosh sahifa uchun.
export function getPublicDashboard() {
  return apiFetch('/api/reports/public-dashboard/', { skipAuth: true })
}

export function exportExcel(params) {
  return apiFetch('/api/reports/export/excel/', { params: cleanParams(params), responseType: 'blob' })
}

export function exportPdf(params) {
  return apiFetch('/api/reports/export/pdf/', { params: cleanParams(params), responseType: 'blob' })
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
