import { Fragment, useMemo } from 'react'
import Icon from '../../components/Icon'
import { DAYS } from '../../data/mockSchedule'
import { addDays, formatDayMonth } from '../../utils/date'
import { deriveScheduleRows, filterRowsForGroupShift } from '../../utils/publicSchedule'

// Dars turiga qarab kartochkaning rangi — chap chegara, fon tinti va badge.
// Nazariy/Amaliy/Aralash bir qarashda ajralib turishi uchun bosh ekranda
// o'qituvchi bo'yicha (tasodifiy) rang o'rniga aynan shu ishlatiladi.
const LESSON_TYPE_STYLES = {
  theory: { border: 'border-l-info', tint: 'bg-info/6', chip: 'bg-info/15 text-info' },
  practice: { border: 'border-l-success', tint: 'bg-success/6', chip: 'bg-success/15 text-success' },
  mixed: { border: 'border-l-warning', tint: 'bg-warning/6', chip: 'bg-warning/15 text-[oklch(58%_0.17_80)]' },
}
const DEFAULT_TYPE_STYLE = { border: 'border-l-base-300', tint: '', chip: 'bg-base-300 text-base-content/60' }

export default function WeeklyCalendarGrid({
  lessons,
  lessonsFor,
  getTiming,
  selectedLessonId,
  onSelectLesson,
  weekStart,
  todayKey,
}) {
  const rows = useMemo(
    () => filterRowsForGroupShift(deriveScheduleRows(lessons), lessons),
    [lessons],
  )

  return (
    <div className="animate-fade-in-up overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
      <div className="overflow-x-auto">
        <div
          className="grid min-w-full"
          style={{
            gridTemplateColumns: `minmax(84px, 100px) repeat(${DAYS.length}, minmax(0, 1fr))`,
            gridTemplateRows: `auto repeat(${rows.length}, minmax(7.5rem, auto))`,
          }}
        >
          <div className="border-b border-r border-base-300 bg-base-200 p-1.5 lg:p-3" />
          {DAYS.map((d, i) => (
            <div
              key={d.key}
              className={[
                'border-b border-r border-base-300 bg-base-200 p-1.5 text-center text-[10px] font-bold uppercase tracking-wide lg:p-3 lg:text-sm',
                d.key === todayKey ? 'bg-primary/15 text-primary' : 'text-base-content/70',
              ].join(' ')}
            >
              {d.label}
              <span className="mt-0.5 block text-[9px] font-medium normal-case tracking-normal opacity-60">
                {formatDayMonth(addDays(weekStart, i))}
              </span>
            </div>
          ))}

          {rows.map(({ key, label, timeSlot }) => (
            <Fragment key={key}>
              <div className="flex items-center gap-1.5 border-b-2 border-r border-base-300 bg-base-200 p-1.5 text-[10px] lg:gap-2 lg:p-3 lg:text-[13px]">
                <Icon name="clock" className="size-3 shrink-0 text-base-content/60 lg:size-4" />
                <div className="flex flex-col leading-tight">
                  {label ? (
                    <span className="font-bold text-base-content">{label}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-warning">
                      <Icon name="alertTriangle" className="size-2.5 shrink-0" />
                      Eski jadval
                    </span>
                  )}
                  <span className="font-medium text-base-content/60">{timeSlot}</span>
                </div>
              </div>
              {DAYS.map((d) => {
                const cellLessons = lessonsFor(d.key, timeSlot)
                return (
                  <div
                    key={`${d.key}-${key}`}
                    className="flex min-h-20 flex-col gap-1 border-b-2 border-r border-base-300 p-1 sm:min-h-24 sm:gap-1.5 sm:p-1.5 lg:gap-2 lg:p-3"
                  >
                    {cellLessons.map((lesson) => {
                      if (lesson.cancelled) {
                        return (
                          <div
                            key={lesson.id}
                            title={lesson.note || lesson.subjectName || 'Dars bekor qilingan'}
                            className="flex w-full flex-col items-start gap-0.5 rounded-2xl border border-dashed border-error/30 bg-error/5 px-2 py-1.5 text-left text-[10.5px] leading-snug text-error/60 line-through lg:px-3.5 lg:py-3 lg:text-sm"
                          >
                            <span className="line-clamp-2 w-full font-bold">{lesson.subjectName}</span>
                            <span className="w-full truncate no-underline">Bekor qilingan</span>
                          </div>
                        )
                      }

                      const timing = getTiming(lesson)
                      const selectable = timing !== 'future'
                      const isSelected = lesson.id === selectedLessonId
                      const typeStyle = LESSON_TYPE_STYLES[lesson.lessonType] ?? DEFAULT_TYPE_STYLE

                      const stateClasses = isSelected
                        ? 'border-transparent bg-primary text-primary-content shadow-md border-y border-r'
                        : timing === 'future'
                          ? 'border-base-300 bg-base-200/50 text-base-content/40 cursor-default border-y border-r'
                          : `border-base-300 ${typeStyle.tint} text-base-content shadow-sm hover:-translate-y-0.5 hover:shadow-md border-y border-r`

                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          disabled={!selectable}
                          onClick={() => onSelectLesson(lesson.id)}
                          title={lesson.note || lesson.subjectName}
                          className={[
                            'flex w-full flex-col items-start gap-0.5 rounded-2xl border-l-4 px-1.5 py-1 text-left text-[9px] leading-snug transition-all duration-200 sm:px-2 sm:py-1.5 sm:text-[10.5px] lg:gap-1 lg:px-3.5 lg:py-3 lg:text-base',
                            typeStyle.border,
                            stateClasses,
                          ].join(' ')}
                        >
                          <div className="flex w-full items-start justify-between gap-1 lg:gap-2">
                            <span className="line-clamp-2 font-bold">{lesson.subjectName}</span>
                            {lesson.lessonTypeDisplay && (
                              <span
                                className={[
                                  'shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold tracking-wide uppercase lg:px-2 lg:text-[9.5px]',
                                  isSelected ? 'bg-white/20 text-white' : typeStyle.chip,
                                ].join(' ')}
                              >
                                {lesson.lessonTypeDisplay}
                              </span>
                            )}
                          </div>
                          <span
                            className={`w-full truncate text-[9.5px] font-medium lg:text-[12px] ${isSelected ? 'opacity-85' : 'text-base-content/55'}`}
                          >
                            {lesson.teacherName}
                          </span>
                          {lesson.room && (
                            <span
                              className={`mt-auto flex w-full items-center gap-1 truncate pt-0.5 text-[9px] lg:text-[11px] ${isSelected ? 'opacity-75' : 'text-base-content/50'}`}
                            >
                              <Icon name="mapPin" className="size-2.5 shrink-0" />
                              <span className="truncate">{lesson.room}</span>
                            </span>
                          )}
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
