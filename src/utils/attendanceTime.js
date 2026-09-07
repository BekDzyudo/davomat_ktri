export const MARK_WINDOW_BEFORE_MS = 0
export const MARK_WINDOW_AFTER_MS = 10 * 60 * 1000

// Belgilash (va tahrirlash) dars boshlanishi bilan (oldindan emas) ochiladi va
// dars tugagandan 10 daqiqa o'tib yopiladi — allaqachon saqlangan bo'lsa ham
// qo'shimcha muddat berilmaydi (backend `assert_can_edit` bilan bir xil qoida).
// `lessonStart`/`lessonEnd` — darsning haqiqiy boshlanish/tugash sanasi+vaqti
// (Date), masalan utils/publicSchedule.js dagi getLessonStart/getLessonEnd orqali.
export function getEditability(lessonStart, lessonEnd, now = new Date()) {
  if (now.getTime() < lessonStart.getTime() - MARK_WINDOW_BEFORE_MS) {
    return { editable: false, reason: 'too_early' }
  }
  if (now.getTime() > lessonEnd.getTime() + MARK_WINDOW_AFTER_MS) {
    return { editable: false, reason: 'too_late' }
  }
  return { editable: true, reason: null }
}

// Belgilash/tahrirlash oynasi qachon yopilishini qaytaradi (Date).
export function getEditabilityDeadline(lessonEnd) {
  return new Date(lessonEnd.getTime() + MARK_WINDOW_AFTER_MS)
}

// Qolgan vaqtni "H:MM:SS" yoki "MM:SS" ko'rinishida formatlaydi.
export function formatRemaining(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
