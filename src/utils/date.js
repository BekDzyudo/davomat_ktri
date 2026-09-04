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

export function getMonday(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function formatWeekRange(monday) {
  const friday = addDays(monday, 4)
  const year = friday.getFullYear()

  if (monday.getMonth() === friday.getMonth()) {
    return `${monday.getDate()}–${friday.getDate()} ${UZ_MONTHS[friday.getMonth()]}, ${year}`
  }

  return `${monday.getDate()} ${UZ_MONTHS[monday.getMonth()]} – ${friday.getDate()} ${UZ_MONTHS[friday.getMonth()]}, ${year}`
}

export function formatDateTime(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function toIsoDate(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function formatDayMonth(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}

export function formatDate(date) {
  const d = new Date(date)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`
}

// /api/reports/* dan keladigan "period" qiymatini ("2026-09" yoki "2026-09-01")
// o'qish uchun qulay yorliqqa aylantiradi.
export function formatPeriodLabel(period) {
  const match = /^(\d{4})-(\d{2})(-(\d{2}))?$/.exec(period ?? '')
  if (!match) return period
  const month = UZ_MONTHS[Number(match[2]) - 1]
  return match[4] ? `${match[4]}-${month}` : `${month?.slice(0, 3)} ${match[1]}`
}
