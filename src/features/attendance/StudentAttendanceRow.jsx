import Icon from '../../components/Icon'
import { ATTENDANCE_STATUSES } from '../../data/attendanceStatuses'

const STATUS_BY_KEY = Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s.key, s]))

const BADGE_TONE = {
  keldi: 'bg-success/10 text-success',
  kelmadi: 'bg-error/10 text-error',
  kech_qoldi: 'bg-warning/10 text-warning',
  sababli: 'bg-info/10 text-info',
}

export default function StudentAttendanceRow({ student, record, onStatusChange, disabled }) {
  const isExcused = record?.status === 'sababli'
  const status = record?.status ? STATUS_BY_KEY[record.status] : null

  return (
    <div className="flex flex-col gap-2 border-b border-base-300 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0 sm:w-56 sm:shrink-0">
        <p className="truncate text-sm font-medium text-base-content">{student.fullName}</p>
      </div>

      {disabled ? (
        <div className="flex flex-col gap-1.5">
          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status ? BADGE_TONE[status.key] : 'bg-base-200 text-base-content/40'}`}
          >
            {status && <Icon name={status.icon} className="size-3.5 shrink-0" />}
            {status?.label ?? 'Belgilanmagan'}
          </span>
          {isExcused && record.reasonText && (
            <p className="flex items-center gap-1 text-xs text-info/80">
              <Icon name="fileText" className="size-3 shrink-0" />
              <span className="truncate">{record.reasonText}</span>
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap gap-1.5">
            {ATTENDANCE_STATUSES.map((s) => {
              const isActive = record?.status === s.key
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => onStatusChange(s.key)}
                  className={[
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-95',
                    isActive ? s.active : s.idle,
                  ].join(' ')}
                >
                  <Icon name={s.icon} className="size-3.5 shrink-0" />
                  {s.label}
                </button>
              )
            })}
          </div>
          {isExcused && record.reasonText && (
            <p className="flex items-center gap-1 text-xs text-info/80">
              <Icon name="fileText" className="size-3 shrink-0" />
              <span className="truncate">{record.reasonText}</span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}
