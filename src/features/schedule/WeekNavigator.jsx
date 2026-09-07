import Icon from '../../components/Icon'
import { addDays, formatWeekRange, getMonday } from '../../utils/date'

export default function WeekNavigator({ weekStart, onChange, className }) {
  const isCurrentWeek = weekStart.getTime() === getMonday(new Date()).getTime()

  return (
    <div className={className ?? 'mb-2 grid grid-cols-12 gap-1.5 sm:mb-4 sm:gap-3'}>
      <div className="col-span-9 flex items-center justify-center gap-1 rounded-box border border-base-300 bg-base-100 px-1.5 py-1.5 shadow-sm sm:col-span-10 sm:gap-3 sm:px-3 sm:py-2.5">
        <button
          type="button"
          onClick={() => onChange(addDays(weekStart, -7))}
          className="group flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/12 text-primary shadow-sm transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-content hover:shadow-md active:scale-95 sm:size-10"
          aria-label="Oldingi hafta"
        >
          <Icon
            name="chevronLeft"
            className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5 sm:size-5"
          />
        </button>

        <div className="flex min-w-0 items-center gap-1">
          <Icon name="calendar" className="size-3 shrink-0 text-primary/60 sm:size-4" />
          <span className="truncate text-[10px] font-medium text-base-content sm:text-sm">{formatWeekRange(weekStart)}</span>
        </div>

        <button
          type="button"
          onClick={() => onChange(addDays(weekStart, 7))}
          className="group flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/12 text-primary shadow-sm transition-all duration-200 hover:scale-105 hover:bg-primary hover:text-primary-content hover:shadow-md active:scale-95 sm:size-10"
          aria-label="Keyingi hafta"
        >
          <Icon
            name="chevronRight"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 sm:size-5"
          />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onChange(getMonday(new Date()))}
        disabled={isCurrentWeek}
        className={`col-span-3 flex items-center justify-center rounded-box border px-1 py-1.5 text-[9px] font-semibold leading-tight shadow-sm transition-all duration-200 sm:col-span-2 sm:px-3 sm:py-2.5 sm:text-sm ${
          isCurrentWeek
            ? 'cursor-default border-base-300 bg-base-200 text-base-content/40'
            : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
        }`}
      >
        Joriy haftaga qaytish
      </button>
    </div>
  )
}
