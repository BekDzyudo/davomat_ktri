import Icon from '../../components/Icon'
import { addDays, formatWeekRange, getMonday } from '../../utils/date'

export default function WeekNavigator({ weekStart, onChange, className }) {
  const isCurrentWeek = weekStart.getTime() === getMonday(new Date()).getTime()

  return (
    <div className={className ?? 'mb-4 grid grid-cols-12 gap-3'}>
      <div className="col-span-10 flex items-center justify-center gap-3 rounded-box border border-base-300 bg-base-100 px-3 py-2.5 shadow-sm">
        <button
          type="button"
          onClick={() => onChange(addDays(weekStart, -7))}
          className="group flex size-8 shrink-0 items-center justify-center rounded-lg text-base-content/60 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
          aria-label="Oldingi hafta"
        >
          <Icon
            name="chevronLeft"
            className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
        </button>

        <div className="flex items-center gap-2">
          <Icon name="calendar" className="size-4 shrink-0 text-primary/60" />
          <span className="text-sm font-medium text-base-content">{formatWeekRange(weekStart)}</span>
        </div>

        <button
          type="button"
          onClick={() => onChange(addDays(weekStart, 7))}
          className="group flex size-8 shrink-0 items-center justify-center rounded-lg text-base-content/60 transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
          aria-label="Keyingi hafta"
        >
          <Icon
            name="chevronRight"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      </div>

      <button
        type="button"
        onClick={() => onChange(getMonday(new Date()))}
        disabled={isCurrentWeek}
        className={`col-span-2 flex items-center justify-center rounded-box border px-3 py-2.5 text-sm font-semibold shadow-sm transition-all duration-200 ${
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
