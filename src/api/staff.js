import { apiFetch } from './client'

/**
 * Butun tashkiliy tuzilma daraxtini (`Staff.jsx` sahifasi uchun) bitta
 * so'rovda qaytaradi — backend `mockStaffStructure.js` bilan BIR XIL shaklda
 * javob beradi (`{id, title, members, children, layout}`, rekursiv), shu
 * sabab qo'shimcha mapping shart emas.
 *
 * Hali root tuzilma (direktor) kiritilmagan bo'lsa — backend 404 qaytaradi,
 * bu yerda `null` sifatida qaytariladi (frontend "hali kiritilmagan" holatini
 * ko'rsatishi uchun).
 */
export async function getStaffTree() {
  try {
    return await apiFetch('/api/staff/units/tree/')
  } catch (err) {
    if (err.status === 404) return null
    throw err
  }
}
