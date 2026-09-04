import { Fragment, useMemo } from 'react'
import Icon from '../../components/Icon'
import { DAYS } from '../../data/mockSchedule'
import { addDays, formatDayMonth } from '../../utils/date'
import { deriveTimeSlots } from '../../utils/publicSchedule'

const CELL_BASE = 'min-h-24 border-b border-r border-base-300 p-1.5 text-left last:border-r-0'

export default function ScheduleGrid({ lessons, getCellLesson, renderCell, onCellClick, editable, weekStart }) {
  const timeSlots = useMemo(() => deriveTimeSlots(lessons), [lessons])

  return (
    <div className="overflow-x-auto rounded-box border border-base-300 bg-base-100 shadow-sm">
      <div
        className="grid min-w-225"
        style={{ gridTemplateColumns: `130px repeat(${DAYS.length}, minmax(150px, 1fr))` }}
      >
        <div className="border-b border-r border-base-300 bg-base-200/50 p-3" />
        {DAYS.map((d, i) => (
          <div
            key={d.key}
            className="border-b border-r border-base-300 bg-base-200/50 p-3 text-center text-xs font-semibold uppercase tracking-wide text-base-content/60 last:border-r-0"
          >
            {d.label}
            {weekStart && (
              <span className="mt-0.5 block text-[10px] font-medium normal-case tracking-normal text-base-content/40">
                {formatDayMonth(addDays(weekStart, i))}
              </span>
            )}
          </div>
        ))}

        {timeSlots.map((slot) => (
          <Fragment key={slot}>
            <div className="flex items-center gap-2 border-b border-r border-base-300 bg-base-200/20 p-3 text-xs font-medium text-base-content/50">
              <Icon name="clock" className="size-3.5 shrink-0 text-base-content/35" />
              {slot}
            </div>
            {DAYS.map((d) => {
              const lesson = getCellLesson(d.key, slot)
              const content = lesson ? (
                renderCell(lesson)
              ) : editable ? (
                <span className="flex size-6 items-center justify-center rounded-full text-base-content/20 transition-colors duration-200 group-hover:bg-primary/10 group-hover:text-primary">
                  <Icon
                    name="plus"
                    className="size-3.5 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110"
                  />
                </span>
              ) : null

              if (!editable) {
                return (
                  <div key={`${d.key}-${slot}`} className={CELL_BASE}>
                    {content}
                  </div>
                )
              }

              return (
                <button
                  key={`${d.key}-${slot}`}
                  type="button"
                  onClick={() => onCellClick(d.key, slot, lesson)}
                  className={`${CELL_BASE} group flex w-full cursor-pointer items-center justify-center transition-colors hover:bg-base-200/60`}
                >
                  {content}
                </button>
              )
            })}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
