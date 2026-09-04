import { Fragment, useMemo } from 'react'
import Icon from '../../components/Icon'
import { DAYS } from '../../data/mockSchedule'
import { getAccentColor } from '../../utils/colors'
import { addDays, formatDayMonth } from '../../utils/date'
import { deriveScheduleRows } from '../../utils/publicSchedule'

export default function WeeklyCalendarGrid({
  lessons,
  lessonsFor,
  getTiming,
  selectedLessonId,
  onSelectLesson,
  weekStart,
  todayKey,
}) {
  const rows = useMemo(() => deriveScheduleRows(lessons), [lessons])

  return (
    <div className="animate-fade-in-up flex h-full flex-col overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
      <div className="flex-1 overflow-auto">
        <div
          className="grid h-full min-w-225"
          style={{
            gridTemplateColumns: `110px repeat(${DAYS.length}, minmax(150px, 1fr))`,
            gridTemplateRows: `auto repeat(${rows.length}, minmax(3.25rem, 1fr))`,
          }}
        >
          <div className="border-b border-r border-base-300 bg-base-200 p-3" />
          {DAYS.map((d, i) => (
            <div
              key={d.key}
              className={[
                'border-b border-r border-base-300 bg-base-200 p-3 text-center text-xs font-bold uppercase tracking-wide last:border-r-0 portrait:text-sm',
                d.key === todayKey ? 'bg-primary/15 text-primary' : 'text-base-content/70',
              ].join(' ')}
            >
              {d.label}
              <span className="mt-0.5 block text-[10px] font-medium normal-case tracking-normal opacity-60">
                {formatDayMonth(addDays(weekStart, i))}
              </span>
            </div>
          ))}

          {rows.map(({ key, label, timeSlot }) => (
            <Fragment key={key}>
              <div className="flex items-center gap-1.5 border-b border-r border-base-300 bg-base-200 p-2.5 text-[11px] font-semibold text-base-content/60 portrait:text-xs">
                <Icon name="clock" className="size-3 shrink-0" />
                <div className="flex flex-col leading-tight">
                  {label ? (
                    <span className="text-base-content/80">{label}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-warning">
                      <Icon name="alertTriangle" className="size-2.5 shrink-0" />
                      Eski jadval
                    </span>
                  )}
                  <span className="font-normal opacity-80">{timeSlot}</span>
                </div>
              </div>
              {DAYS.map((d) => {
                const cellLessons = lessonsFor(d.key, timeSlot)
                return (
                  <div
                    key={`${d.key}-${key}`}
                    className="flex min-h-16 flex-col gap-1 border-b border-r border-base-300 p-1.5 last:border-r-0"
                  >
                    {cellLessons.map((lesson) => {
                      const timing = getTiming(lesson)
                      const selectable = timing !== 'future'
                      const isSelected = lesson.id === selectedLessonId
                      const accent = getAccentColor(lesson.teacherName)

                      const stateClasses =
                        timing === 'future'
                          ? 'border-base-300 bg-base-200/60 text-base-content/40 cursor-default'
                          : `border-l-4 bg-base-100 text-base-content hover:shadow-sm ${accent.borderL} border-y border-r border-base-300`

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          disabled={!selectable}
                          onClick={() => onSelectLesson(lesson.id)}
                          className={[
                            'flex w-full flex-col items-start gap-0.5 rounded-lg border px-2 py-1.5 text-left text-[11px] leading-tight transition-all duration-150 portrait:px-2.5 portrait:py-2 portrait:text-xs',
                            isSelected
                              ? `border-l-4 bg-primary text-primary-content shadow-sm ${accent.borderL}`
                              : stateClasses,
                          ].join(' ')}
                        >
                          <span className="w-full truncate font-semibold">{lesson.subjectName}</span>
                          <span
                            className={`w-full truncate ${isSelected ? 'opacity-85' : accent.text}`}
                          >
                            {lesson.teacherName}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
