// Turli obyektlarga (o'qituvchi, guruh, fan) barqaror, rang-barang urg'u
// berish uchun — bir xil nom doim bir xil rangga tushadi.
const PALETTE = [
  { bg: 'bg-primary/12', text: 'text-primary', solid: 'bg-primary', borderL: 'border-l-primary' },
  { bg: 'bg-secondary/15', text: 'text-secondary', solid: 'bg-secondary', borderL: 'border-l-secondary' },
  { bg: 'bg-accent/15', text: 'text-accent', solid: 'bg-accent', borderL: 'border-l-accent' },
  { bg: 'bg-info/15', text: 'text-info', solid: 'bg-info', borderL: 'border-l-info' },
  { bg: 'bg-error/12', text: 'text-error', solid: 'bg-error', borderL: 'border-l-error' },
  {
    bg: 'bg-[oklch(66%_0.20_330)]/15',
    text: 'text-[oklch(58%_0.22_330)]',
    solid: 'bg-[oklch(66%_0.20_330)]',
    borderL: 'border-l-[oklch(66%_0.20_330)]',
  },
  { bg: 'bg-warning/15', text: 'text-[oklch(58%_0.17_80)]', solid: 'bg-warning', borderL: 'border-l-warning' },
  { bg: 'bg-success/15', text: 'text-[oklch(48%_0.16_155)]', solid: 'bg-success', borderL: 'border-l-success' },
]

function hashSeed(seed) {
  const str = String(seed ?? '')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

// `seed` — istalgan barqaror qiymat (id yoki nom). Bir xil seed doim bir xil
// palitra elementini qaytaradi.
export function getAccentColor(seed) {
  return PALETTE[hashSeed(seed) % PALETTE.length]
}

export const CHART_PALETTE = [
  'var(--color-primary)',
  'var(--color-secondary)',
  'var(--color-accent)',
  'var(--color-info)',
  'oklch(66% 0.20 330)',
  'var(--color-error)',
  'var(--color-warning)',
  'var(--color-success)',
]
