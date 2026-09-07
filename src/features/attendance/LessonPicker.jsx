import Icon from '../../components/Icon'
import { getEditability } from '../../utils/attendanceTime'
import { getLessonEnd, getLessonStart } from '../../utils/publicSchedule'

const BADGE_LABEL = {
  editable: 'Ochiq',
  saved: 'Yakunlangan',
  future: 'Kutilmoqda',
  closed: 'Yopiq',
}

const BADGE_TONE = {
  editable: 'bg-success/10 text-success',
  saved: 'bg-info/10 text-info',
  future: 'bg-base-300 text-base-content/50',
  closed: 'bg-base-300 text-base-content/50',
}

export default function LessonPicker({ lessons, selectedId, weekStart, onSelect, subjectName, groupName, hasSavedFor }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {lessons.map((lesson) => {
        const start = getLessonStart(weekStart, lesson.day, lesson.timeSlot)
        const end = getLessonEnd(weekStart, lesson.day, lesson.timeSlot)
        const hasSaved = hasSavedFor(lesson.id)
        const { editable, reason } = getEditability(start, end)
        const state = editable ? 'editable' : hasSaved ? 'saved' : reason === 'too_early' ? 'future' : 'closed'
        const isSelected = lesson.id === selectedId

        return (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onSelect(lesson.id)}
            className={[
              'group flex w-64 shrink-0 flex-col gap-2 rounded-2xl border p-4 text-left transition-all duration-200 hover:shadow-md',
              isSelected
                ? 'border-primary bg-primary/5 shadow-md ring-2 ring-primary/20'
                : 'border-base-300 bg-base-100 hover:border-primary/30',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold tabular-nums text-base-content/65">
                <Icon name="clock" className="size-3.5 shrink-0" />
                {lesson.timeSlot}
              </span>
              <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${BADGE_TONE[state]}`}>
                {BADGE_LABEL[state]}
              </span>
            </div>
            <p className="line-clamp-2 min-h-10 text-sm font-black leading-tight text-base-content">
              {subjectName(lesson.subjectId)}
            </p>
            <p className="flex items-center gap-1.5 truncate rounded-lg bg-base-200/60 px-2 py-1.5 text-xs text-base-content/65">
              <Icon name="group" className="size-3.5 shrink-0 text-primary/65" />
              <span className="truncate">
                {groupName(lesson.groupId)} · {lesson.room}
              </span>
            </p>
            <div className="flex items-center justify-between border-t border-base-300/70 pt-2 text-[10px] font-bold uppercase tracking-wide text-base-content/40">
              <span>{isSelected ? 'Tanlangan' : 'Darsni tanlash'}</span>
              <Icon name="chevronRight" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        )
      })}
    </div>
  )
}
