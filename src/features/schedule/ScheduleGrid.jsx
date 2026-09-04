import { Fragment, useMemo } from 'react'
import Icon from '../../components/Icon'
import { DAYS } from '../../data/mockSchedule'
import { addDays, formatDayMonth } from '../../utils/date'
import { deriveScheduleRows } from '../../utils/publicSchedule'

const CELL_BASE = 'min-h-24 border-b-2 border-r border-base-300 p-2 text-left last:border-r-0'

export default function ScheduleGrid({ lessons, getCellLesson, renderCell, onCellClick, editable, weekStart }) {
  const rows = useMemo(() => deriveScheduleRows(lessons), [lessons])

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

        {rows.map(({ key, label, timeSlot }) => (
          <Fragment key={key}>
            <div className="flex items-center gap-2 border-b-2 border-r border-base-300 bg-base-200/20 p-3 text-xs font-medium text-base-content/50">
              <Icon name="clock" className="size-3.5 shrink-0 text-base-content/55" />
              <div className="flex flex-col">
                {label ? (
                  <span className="text-[11px] font-semibold text-base-content/70">{label}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-warning">
                    <Icon name="alertTriangle" className="size-3 shrink-0" />
                    Eski jadval
                  </span>
                )}
                <span>{timeSlot}</span>
              </div>
            </div>
            {DAYS.map((d, i) => {
              const lesson = getCellLesson(d.key, timeSlot)
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
                  <div key={`${d.key}-${key}`} className={CELL_BASE}>
                    {content}
                  </div>
                )
              }

              return (
                <button
                  key={`${d.key}-${key}`}
                  type="button"
                  onClick={() => onCellClick(d.key, timeSlot, lesson, addDays(weekStart, i))}
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
