import Icon from '../../components/Icon'
import { ATTENDANCE_STATUSES } from '../../data/attendanceStatuses'

const STATUS_BY_KEY = Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s.key, s]))

const BADGE_TONE = {
  keldi: 'bg-success/10 text-success',
  kelmadi: 'bg-error/10 text-error',
  kech_qoldi: 'bg-warning/10 text-warning',
  sababli: 'bg-info/10 text-info',
}

export default function AttendancePanel({ lesson, timing, attendance, isLoading }) {
  if (!lesson) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/50">
        <Icon name="badgeCheck" className="size-10" />
        <p className="text-sm portrait:text-base">Hozircha tugagan dars yo'q</p>
      </div>
    )
  }

  const presentCount = attendance.filter((a) => a.status === 'keldi').length

  return (
    <div
      key={lesson.id}
      className="animate-fade-in-up flex h-full flex-col overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm"
    >
      <div className="shrink-0 border-b border-base-300 bg-primary/10 p-5 portrait:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary portrait:text-sm">
          {timing === 'ongoing' ? 'Hozir davom etmoqda' : 'Yakunlangan dars'}
        </p>
        <h3 className="mt-1 truncate text-lg font-bold text-base-content portrait:text-2xl">
          {lesson.subjectName}
        </h3>
        <p className="mt-1 truncate text-sm text-base-content/70 portrait:text-base">
          {lesson.groupName} · {lesson.teacherName} · {lesson.room}
        </p>
        {!isLoading && (
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-base-content portrait:text-4xl">
              {presentCount}
              <span className="text-base font-medium text-base-content/50">/{attendance.length}</span>
            </span>
            <span className="text-xs text-base-content/60 portrait:text-sm">tinglovchi keldi</span>
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-md text-primary" />
          </div>
        ) : attendance.length === 0 ? (
          <p className="py-8 text-center text-sm text-base-content/50">
            {timing === 'ongoing' ? 'Dars hali davom etmoqda' : "Ma'lumot yo'q"}
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {attendance.map((entry) => {
              const statusInfo = STATUS_BY_KEY[entry.status]
              return (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-2 rounded-xl bg-base-200 px-3 py-2 transition-colors hover:bg-base-300/60"
                >
                  <span className="truncate text-sm font-medium text-base-content portrait:text-base">
                    {entry.studentName}
                  </span>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold portrait:text-xs ${BADGE_TONE[entry.status]}`}
                  >
                    {statusInfo && <Icon name={statusInfo.icon} className="size-3 shrink-0" />}
                    {entry.statusLabel ?? statusInfo?.label ?? entry.status}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
