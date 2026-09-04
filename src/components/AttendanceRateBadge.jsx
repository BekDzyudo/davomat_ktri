import { getRateTone } from '../utils/attendanceRate'

const TONE_CLASSES = {
  error: 'bg-error/10 text-error',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
}

export default function AttendanceRateBadge({ rate, className = '' }) {
  return (
    <span
      className={`inline-flex min-w-14 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[getRateTone(rate)]} ${className}`}
    >
      {rate}%
    </span>
  )
}
