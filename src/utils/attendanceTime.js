export const MARK_WINDOW_BEFORE_MS = 15 * 60 * 1000
export const MARK_WINDOW_AFTER_MS = 60 * 60 * 1000
export const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000

// Dars boshlanishidan 15 daqiqa oldin ochiladi, 1 soatdan keyin yopiladi.
// Bir marta saqlangandan so'ng, 24 soat ichida tahrirlash imkoni ochiq qoladi.
// `lessonStart` — darsning haqiqiy boshlanish sanasi+vaqti (Date), masalan
// utils/publicSchedule.js dagi getLessonStart(weekStart, day, timeSlot) orqali.
export function getEditability(lessonStart, hasSaved, now = new Date()) {
  if (!hasSaved) {
    if (now.getTime() < lessonStart.getTime() - MARK_WINDOW_BEFORE_MS) {
      return { editable: false, reason: 'too_early' }
    }
    if (now.getTime() > lessonStart.getTime() + MARK_WINDOW_AFTER_MS) {
      return { editable: false, reason: 'too_late' }
    }
    return { editable: true, reason: null }
  }

  if (now.getTime() - lessonStart.getTime() > EDIT_WINDOW_MS) {
    return { editable: false, reason: 'edit_expired' }
  }
  return { editable: true, reason: null }
}

// Belgilash/tahrirlash oynasi qachon yopilishini qaytaradi (Date).
export function getEditabilityDeadline(lessonStart, hasSaved) {
  return new Date(lessonStart.getTime() + (hasSaved ? EDIT_WINDOW_MS : MARK_WINDOW_AFTER_MS))
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
