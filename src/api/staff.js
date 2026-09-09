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

/**
 * Xodimning BUGUNGI yo'qligini "sababli" deb belgilaydi (yoki mavjud
 * sababni yangilaydi) — `StaffAnalysisModal`dagi "Kelmaganlar" bo'limida
 * "Sabab kiritish"/"Sababli" bo'limida "O'zgartirish" tugmalari shu orqali
 * ishlaydi. Muvaffaqiyatli bo'lsa, chaqiruvchi tomon `getStaffTree()`ni
 * qayta so'rab, xodim "Sababli" tabiga o'tganini ko'rsatishi kerak.
 */
export async function submitStaffExcuse(staffId, { reasonText, file }) {
  const formData = new FormData()
  formData.append('reason_text', reasonText)
  if (file) formData.append('reason_file', file)
  return apiFetch(`/api/staff/members/${staffId}/excuse/`, { method: 'POST', formData })
}
