export const DEFAULT_ROOMS = [
  'Asosiy bino 1-xona',
  'Asosiy bino 2-xona',
  'Asosiy bino 3-xona',
  'Asosiy bino 4-xona',
  'TTJ 1-xona',
  'TTJ 2-xona',
  'TTJ 3-xona',
  'TTJ 4-xona',
  'ZOOM platformasi',
]

const STORAGE_KEY = 'davomat_ktri.customRooms'

// Foydalanuvchi qo'shgan qo'shimcha xonalar brauzer localStorage'ida
// saqlanadi — backendda alohida "Room" resursi yo'q, xona nomi Schedule
// yozuvida oddiy matn maydoni sifatida saqlanadi.
export function loadCustomRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addCustomRoom(name) {
  const trimmed = name.trim()
  if (!trimmed) return
  const current = loadCustomRooms()
  if (current.includes(trimmed) || DEFAULT_ROOMS.includes(trimmed)) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, trimmed]))
  } catch {
    // localStorage mavjud bo'lmasa (masalan xususiy rejim) jim o'tkazib yuboramiz
  }
}
