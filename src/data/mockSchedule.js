export const DAYS = [
  { key: 'mon', label: 'Dushanba' },
  { key: 'tue', label: 'Seshanba' },
  { key: 'wed', label: 'Chorshanba' },
  { key: 'thu', label: 'Payshanba' },
  { key: 'fri', label: 'Juma' },
  { key: 'sat', label: 'Shanba' },
]

// Dars davomiyligi 80 daqiqa. Har smenada faqat 1-4 oralig'ida para bo'ladi —
// "5-para" kabi raqamlar yo'q. 1-smenaning 4-parasi va 2-smenaning 1-parasi
// bitta xil vaqtga to'g'ri keladi (14:00 - 15:20), lekin baribir jadvalda
// alohida-alohida qator sifatida ko'rsatiladi.
const SHIFTS = [
  { shift: 1, slots: ['09:00 - 10:20', '10:30 - 11:50', '12:00 - 13:20', '14:00 - 15:20'] },
  { shift: 2, slots: ['14:00 - 15:20', '15:30 - 16:50', '17:00 - 18:20', '18:30 - 19:50'] },
]

// Jadval qatorlari: har biri o'ziga xos smena+para, ba'zilari bir xil vaqtga
// to'g'ri kelsa ham (masalan 1-4 va 2-1) alohida qator bo'lib qoladi.
export const SCHEDULE_ROWS = SHIFTS.flatMap(({ shift, slots }) =>
  slots.map((timeSlot, i) => ({
    key: `${shift}-${i + 1}`,
    label: `${shift}-smena, ${i + 1}-para`,
    timeSlot,
  })),
)

export const TIME_SLOTS = [...new Set(SCHEDULE_ROWS.map((r) => r.timeSlot))].sort()
