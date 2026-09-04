import Icon from '../../components/Icon'
import { getEditability } from '../../utils/attendanceTime'
import { getLessonStart } from '../../utils/publicSchedule'

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
        const hasSaved = hasSavedFor(lesson.id)
        const { editable, reason } = getEditability(start, hasSaved)
        const state = editable ? 'editable' : hasSaved ? 'saved' : reason === 'too_early' ? 'future' : 'closed'
        const isSelected = lesson.id === selectedId

        return (
          <button
            key={lesson.id}
            type="button"
            onClick={() => onSelect(lesson.id)}
            className={[
              'flex w-56 shrink-0 flex-col gap-1.5 rounded-box border p-3.5 text-left transition-all duration-200',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20'
                : 'border-base-300 bg-base-100 hover:border-base-content/20',
            ].join(' ')}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-base-content/60">
                <Icon name="clock" className="size-3.5 shrink-0" />
                {lesson.timeSlot}
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${BADGE_TONE[state]}`}>
                {BADGE_LABEL[state]}
              </span>
            </div>
            <p className="truncate text-sm font-semibold text-base-content">
              {subjectName(lesson.subjectId)}
            </p>
            <p className="flex items-center gap-1.5 truncate text-xs text-base-content/60">
              <Icon name="group" className="size-3.5 shrink-0" />
              <span className="truncate">
                {groupName(lesson.groupId)} · {lesson.room}
              </span>
            </p>
          </button>
        )
      })}
    </div>
  )
}
