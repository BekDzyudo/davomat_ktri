export function getRateTone(rate) {
  if (rate < 70) return 'error'
  if (rate < 85) return 'warning'
  return 'success'
}
