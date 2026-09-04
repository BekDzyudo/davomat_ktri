export function getAttendanceRate(entries) {
  if (entries.length === 0) return 0
  const present = entries.filter((e) => e.status === 'keldi').length
  return Math.round((present / entries.length) * 100)
}
