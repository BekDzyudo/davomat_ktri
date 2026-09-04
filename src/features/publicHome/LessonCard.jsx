import Icon from '../../components/Icon'

const TIMING_STYLES = {
  future: 'border-base-300 bg-base-100/60',
  ongoing: 'border-success/40 bg-success/5 hover:shadow-md',
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
        'flex w-full flex-col gap-2.5 rounded-2xl border p-4 text-left transition-all duration-200 portrait:p-5',
        isSelected
          ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/30'
          : TIMING_STYLES[timing],
        selectable ? 'cursor-pointer active:scale-[0.98]' : 'cursor-default opacity-70',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-base-content/50 portrait:text-sm">
          <Icon name="clock" className="size-3.5 shrink-0" />
          {lesson.timeSlot}
        </span>
        {timing === 'ongoing' && (
          <span className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-success">
            <span className="size-1.5 animate-pulse rounded-full bg-success" />
            Hozir
          </span>
        )}
        {timing === 'future' && (
          <span className="rounded-full bg-base-200 px-2 py-0.5 text-[10px] font-medium text-base-content/40">
            Kutilmoqda
          </span>
        )}
      </div>

      <p className="truncate text-base font-bold text-base-content portrait:text-lg">
        {subjectName(lesson.subjectId)}
      </p>

      <div className="flex flex-col gap-1 text-sm text-base-content/60 portrait:text-base">
        <span className="flex items-center gap-1.5 truncate">
          <Icon name="group" className="size-4 shrink-0 text-primary/60" />
          {groupName(lesson.groupId)}
        </span>
        <span className="flex items-center gap-1.5 truncate">
          <Icon name="user" className="size-4 shrink-0 text-primary/60" />
          {teacherName(lesson.teacherId)}
        </span>
        <span className="flex items-center gap-1.5 truncate">
          <Icon name="mapPin" className="size-4 shrink-0 text-primary/60" />
          {lesson.room}
        </span>
      </div>
    </button>
  )
}
