import { apiFetch } from './client'

function mapFeedItemFromApi(item) {
  return {
    id: item.id,
    personType: item.person_type, // 'student' | 'teacher' | 'staff'
    name: item.name,
    meta: item.meta,
    avatar: item.avatar,
    direction: item.direction, // 'entry' | 'exit' | ''
    time: item.time,
  }
}

/**
 * "Jonli monitoring" sahifasi (`LiveMonitoring.jsx`) uchun — bitta so'rovda
 * BUGUNGI haqiqiy kelgan/kelmagan sonlari (`counts`) VA eng so'nggi Face ID
 * hodisalari ("Jonli efir" — kim kirdi/chiqdi, `feed`) qaytadi.
 *
 * `type` — `'student' | 'teacher' | 'staff'` bo'lsa, faqat o'sha toifadagi
 * hodisalar bilan filtrlanadi (bo'sh/`undefined` — hammasi). Real vaqtda
 * push (websocket) yo'q — chaqiruvchi tomon davriy so'rov (polling) bilan
 * yangilashi kerak.
 */
export async function getLiveMonitoring({ type, limit = 20 } = {}) {
  const data = await apiFetch('/api/faceid/live/', { params: { type, limit } })
  return {
    counts: data.counts,
    feed: (data.feed ?? []).map(mapFeedItemFromApi),
  }
}
