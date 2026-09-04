import StatCard from '../../components/charts/StatCard'
import Icon from '../../components/Icon'
import { ATTENDANCE_STATUSES } from '../../data/attendanceStatuses'
import { getRateTone } from '../../utils/attendanceRate'
import { formatDate } from '../../utils/date'

const STATUS_BY_KEY = Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s.key, s]))

const BADGE_TONE = {
  keldi: 'bg-success/10 text-success',
  kelmadi: 'bg-error/10 text-error',
  kech_qoldi: 'bg-warning/10 text-warning',
  sababli: 'bg-info/10 text-info',
}

export default function StudentDashboard({ data }) {
  const summary = data?.summary ?? {}
  const recent = data?.recent ?? []

  return (
    <div className="flex flex-col gap-4">
      <StatCard
        icon="badgeCheck"
        label="Umumiy davomat foizi"
        value={`${summary.attendance_percent ?? 0}%`}
        tone={getRateTone(summary.attendance_percent ?? 0)}
        sublabel={summary.total ? `${summary.total} ta darsdan hisoblangan` : undefined}
      />

      <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
        <h2 className="mb-3 text-sm font-semibold text-base-content">So'nggi davomat</h2>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-base-content/50">
            <Icon name="calendar" className="size-8" />
            <p className="text-sm">Hali davomat yozuvi yo'q</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {recent.map((entry, i) => {
              const status = STATUS_BY_KEY[entry.status]
              const date = entry.date ?? entry.marked_at
              const subject = entry.subject_name ?? entry.subject ?? '—'
              return (
                <li
                  key={entry.id ?? i}
                  className="flex items-center justify-between gap-2 rounded-xl bg-base-200/50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-base-content">{subject}</p>
                    {date && <p className="text-xs text-base-content/50">{formatDate(date)}</p>}
                  </div>
                  {status && (
                    <span
                      className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${BADGE_TONE[entry.status]}`}
                    >
                      <Icon name={status.icon} className="size-3" />
                      {status.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
