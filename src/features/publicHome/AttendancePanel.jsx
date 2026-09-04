import Icon from '../../components/Icon'
import { ATTENDANCE_STATUSES } from '../../data/attendanceStatuses'

const STATUS_BY_KEY = Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s.key, s]))

const TEXT_TONE = {
  keldi: 'text-[oklch(48%_0.16_155)]',
  kelmadi: 'text-error',
  kech_qoldi: 'text-[oklch(58%_0.17_80)]',
  sababli: 'text-info',
}

const AVATAR_TONE = {
  keldi: 'bg-success/15 text-success',
  kelmadi: 'bg-error/15 text-error',
  kech_qoldi: 'bg-warning/15 text-warning',
  sababli: 'bg-info/15 text-info',
}

export default function AttendancePanel({ lesson, timing, attendance, isLoading }) {
  if (!lesson) {
    return (
      <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-base-300 bg-base-100 p-8 text-center text-base-content/70">
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
      <div className="relative shrink-0 overflow-hidden p-5 portrait:p-6">
        <img
          src="/bino.png"
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-[oklch(52%_0.20_290)]/85 via-[oklch(52%_0.16_260)]/80 to-[oklch(62%_0.14_190)]/85" />

        <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 py-1 pl-1 pr-3 text-xs font-black uppercase tracking-wide text-white backdrop-blur-sm portrait:text-sm">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/90 text-[oklch(52%_0.20_290)]">
            {timing === 'ongoing' ? (
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-current" />
              </span>
            ) : (
              <Icon name="badgeCheck" className="size-3" />
            )}
          </span>
          {timing === 'ongoing' ? 'Hozir davom etmoqda' : 'Yakunlangan dars'}
        </span>

        <h3 className="relative mt-3 text-lg font-bold leading-tight text-white portrait:text-2xl">
          {lesson.subjectName}
        </h3>
        <p className="relative mt-1 truncate text-sm text-white/80 portrait:text-base">
          {lesson.groupName} · {lesson.teacherName} · {lesson.room}
        </p>

        {!isLoading && (
          <div className="relative mt-4 inline-flex items-center gap-2.5 rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
              <Icon name="badgeCheck" className="size-4.5" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="truncate text-base font-black text-white">
                {presentCount}/{attendance.length}
              </p>
              <p className="truncate text-[11px] text-white/70 portrait:text-xs">Davomat</p>
            </div>
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
                  className="flex items-center gap-2.5 rounded-xl bg-base-200 px-3 py-2 transition-colors hover:bg-base-300/60"
                >
                  <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full ${AVATAR_TONE[entry.status] ?? 'bg-base-300 text-base-content/70'}`}
                  >
                    <Icon name={statusInfo?.icon ?? 'user'} className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-base-content portrait:text-base">
                    {entry.studentName}
                  </span>
                  <span
                    className={`shrink-0 text-xs font-bold portrait:text-sm ${TEXT_TONE[entry.status] ?? 'text-base-content/60'}`}
                  >
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
