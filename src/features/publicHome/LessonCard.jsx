import Icon from '../../components/Icon'

const TIMING_STYLES = {
  future: 'border-base-300 bg-base-100/70',
  ongoing: 'border-success/40 bg-success/[0.045] hover:border-success/60 hover:shadow-md',
  completed: 'border-base-300 bg-base-100 hover:border-primary/40 hover:shadow-md',
}

export default function LessonCard({
  lesson,
  timing,
  subjectName,
  groupName,
  teacherName,
  isSelected,
  onClick,
}) {
  const selectable = timing !== 'future'

  return (
    <button
      type="button"
      disabled={!selectable}
      onClick={onClick}
      className={[
        'group relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 portrait:p-5',
        isSelected
          ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/30'
          : TIMING_STYLES[timing],
        selectable ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default opacity-70',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-bold tabular-nums text-base-content/65 portrait:text-sm">
          <Icon name="clock" className="size-3.5 shrink-0" />
          {lesson.timeSlot}
        </span>
        {timing === 'ongoing' && (
          <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-success">
            <span className="size-1.5 animate-pulse rounded-full bg-success" />
            Hozir
          </span>
        )}
        {timing === 'future' && (
          <span className="rounded-full bg-base-200 px-2 py-1 text-[10px] font-bold text-base-content/45">
            Kutilmoqda
          </span>
        )}
        {timing === 'completed' && (
          <span className="flex items-center gap-1 rounded-full bg-info/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-info">
            <Icon name="check" className="size-3" />
            Yakunlangan
          </span>
        )}
      </div>

      <p className="line-clamp-2 min-h-12 text-base font-black leading-tight text-base-content portrait:text-lg">
        {subjectName(lesson.subjectId)}
      </p>

      <div className="flex flex-col gap-1.5 text-xs text-base-content/65 portrait:text-sm">
        <span className="flex min-w-0 items-center gap-1.5 truncate rounded-lg bg-base-200/60 px-2 py-1.5">
          <Icon name="group" className="size-3.5 shrink-0 text-primary/65" />
          {groupName(lesson.groupId)}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 truncate px-2">
          <Icon name="user" className="size-3.5 shrink-0 text-primary/65" />
          {teacherName(lesson.teacherId)}
        </span>
        <span className="flex min-w-0 items-center gap-1.5 truncate px-2">
          <Icon name="mapPin" className="size-3.5 shrink-0 text-primary/65" />
          {lesson.room}
        </span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-base-300/70 pt-3 text-[10px] font-bold uppercase tracking-wide text-base-content/40">
        <span>{isSelected ? 'Tanlangan dars' : 'Davomatni ko\'rish'}</span>
        <Icon name="chevronRight" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </button>
  )
}
