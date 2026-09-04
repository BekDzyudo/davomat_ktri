import { addDays, formatDayMonth } from '../../utils/date'

export default function DayTabs({ days, activeDay, onSelect, todayKey, weekStart }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {days.map((d, i) => {
        const isActive = d.key === activeDay
        const isToday = d.key === todayKey

        return (
          <button
            key={d.key}
            type="button"
            onClick={() => onSelect(d.key)}
            className={[
              'relative shrink-0 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 portrait:px-6 portrait:py-4 portrait:text-base',
              isActive
                ? 'scale-105 bg-primary text-primary-content shadow-md'
                : 'border border-base-300 bg-base-100 text-base-content/70 hover:border-primary/30 hover:bg-base-200',
            ].join(' ')}
          >
            {d.label}
            {weekStart && (
              <span className={`ml-1.5 text-xs font-normal ${isActive ? 'text-primary-content/70' : 'text-base-content/40'}`}>
                {formatDayMonth(addDays(weekStart, i))}
              </span>
            )}
            {isToday && (
              <span
                className={[
                  'absolute -right-1 -top-1 flex size-2.5 rounded-full ring-2 ring-base-100',
                  isActive ? 'bg-success-content' : 'bg-success',
                ].join(' ')}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
