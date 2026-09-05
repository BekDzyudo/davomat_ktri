export const DAYS = [
  { key: 'mon', label: 'Dushanba' },
  { key: 'tue', label: 'Seshanba' },
  { key: 'wed', label: 'Chorshanba' },
  { key: 'thu', label: 'Payshanba' },
  { key: 'fri', label: 'Juma' },
]

// Dars davomiyligi 80 daqiqa. Har smenada faqat 1-4 oralig'ida para bo'ladi —
// "5-para" kabi raqamlar yo'q. 1-smenaning 4-parasi va 2-smenaning 1-parasi
// bitta xil vaqtga to'g'ri keladi (14:00 - 15:20) — bu ikkalasi bitta haqiqiy
// vaqt oralig'i bo'lgani uchun pastda bitta qatorga birlashtiriladi (aks holda
// jadvalda bir xil vaqt ikki marta chiqib, bo'sh joy ham, band joy ham
// ikkilanib ko'rsatilardi).
const SHIFTS = [
  { shift: 1, slots: ['09:00 - 10:20', '10:30 - 11:50', '12:00 - 13:20', '14:00 - 15:20'] },
  { shift: 2, slots: ['14:00 - 15:20', '15:30 - 16:50', '17:00 - 18:20', '18:30 - 19:50'] },
]

// Jadval qatorlari: bir xil vaqtga to'g'ri keladigan smena+para'lar (masalan
// 1-4 va 2-1) bitta qatorga birlashtirilib, yorlig'i ikkalasini ham ko'rsatadi.
const rowsByTimeSlot = new Map()
for (const { shift, slots } of SHIFTS) {
  slots.forEach((timeSlot, i) => {
    const label = `${shift}-smena, ${i + 1}-para`
    const existing = rowsByTimeSlot.get(timeSlot)
    if (existing) {
      existing.label = `${existing.label} / ${label}`
    } else {
      rowsByTimeSlot.set(timeSlot, { key: timeSlot, label, timeSlot })
    }
  })
}

export const SCHEDULE_ROWS = [...rowsByTimeSlot.values()].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))

export const TIME_SLOTS = [...new Set(SCHEDULE_ROWS.map((r) => r.timeSlot))].sort()
