// Xodim oylik davomat taqvimi hali backendga ulanmagan — StaffMemberRow'dagi
// bitta kunlik `checkIn`dan farqli o'laroq, bu yerda har bir xodim uchun
// butun oy bo'yicha kunlik holat (vaqtida/kechikkan/kelmagan) va kirish-chiqish
// vaqtlari xodim ID'si + sanadan hosil qilingan deterministik "tasodifiy"
// qiymat asosida generatsiya qilinadi (backend ulanganda butunlay almashtiriladi).

export const STAFF_DAY_STATUS = {
  VAQTIDA: 'vaqtida',
  KECH15: 'kech15',
  KECH15PLUS: 'kech15plus',
  KELMAGAN: 'kelmagan',
}

export const STAFF_STATUS_LEGEND = [
  { key: STAFF_DAY_STATUS.VAQTIDA, label: 'Vaqtida', dot: 'bg-success', cell: 'bg-success text-white' },
  { key: STAFF_DAY_STATUS.KECH15, label: '15m gacha kechikkan', dot: 'bg-warning', cell: 'bg-warning text-white' },
  { key: STAFF_DAY_STATUS.KECH15PLUS, label: "15m dan ko'p kechikkan", dot: 'bg-accent', cell: 'bg-accent text-white' },
  { key: STAFF_DAY_STATUS.KELMAGAN, label: 'Kelmagan', dot: 'bg-error', cell: 'bg-error text-white' },
]

const STATUS_CELL_BY_KEY = Object.fromEntries(STAFF_STATUS_LEGEND.map((s) => [s.key, s.cell]))

export function staffStatusCellClass(status) {
  return STATUS_CELL_BY_KEY[status] ?? ''
}

function seedFor(str) {
  let h = 0
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % 9973
  return h
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function minutesToClock(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${pad2(h)}:${pad2(m)}`
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// Oyning to'liq kalendar to'rini (Dushanbadan boshlab) qaytaradi — oy
// boshi/oxiridagi bo'sh kataklar `null` bo'ladi.
export function buildMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leading = (firstDay.getDay() + 6) % 7
  const cells = []
  for (let i = 0; i < leading; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// Berilgan xodim va sana uchun kunlik davomat ma'lumotini qaytaradi. Dam olish
// kunlari (shanba/yakshanba) va kelajakdagi sanalar uchun `status: null`
// qaytariladi (taqvimda kulrang, bosib bo'lmaydigan katak sifatida ko'rsatiladi).
export function getStaffDayInfo(member, date) {
  const weekday = date.getDay()
  const isWeekend = weekday === 0 || weekday === 6

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cmpDate = new Date(date)
  cmpDate.setHours(0, 0, 0, 0)
  const isFuture = cmpDate.getTime() > today.getTime()
  const isToday = isSameDay(date, today)

  if (isWeekend || isFuture) {
    return { date, isWeekend, isFuture, isToday, status: null }
  }

  const seed = seedFor(`${member.id}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`)
  const roll = seed % 100

  let status
  if (roll < 8) status = STAFF_DAY_STATUS.KELMAGAN
  else if (roll < 18) status = STAFF_DAY_STATUS.KECH15PLUS
  else if (roll < 35) status = STAFF_DAY_STATUS.KECH15
  else status = STAFF_DAY_STATUS.VAQTIDA

  if (status === STAFF_DAY_STATUS.KELMAGAN) {
    return { date, isWeekend, isFuture, isToday, status, checkIn: null, checkOut: null }
  }

  const checkInMinutes =
    status === STAFF_DAY_STATUS.VAQTIDA
      ? 8 * 60 + 30 + (seed % 30)
      : status === STAFF_DAY_STATUS.KECH15
        ? 9 * 60 + (seed % 15)
        : 9 * 60 + 16 + (seed % 40)
  const checkOutMinutes = 18 * 60 + (seed % 40)
  const checkInSeconds = seed % 60
  const checkOutSeconds = (seed * 7) % 60

  const overtimeMinutes = Math.max(0, 9 * 60 - checkInMinutes) + Math.max(0, checkOutMinutes - 18 * 60)

  return {
    date,
    isWeekend,
    isFuture,
    isToday,
    status,
    checkIn: `${minutesToClock(checkInMinutes)}:${pad2(checkInSeconds)}`,
    checkOut: `${minutesToClock(checkOutMinutes)}:${pad2(checkOutSeconds)}`,
    netWorkMinutes: 8 * 60,
    overtimeMinutes,
  }
}

export function formatDurationUz(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${h} soat ${m} daqiqa`
}
