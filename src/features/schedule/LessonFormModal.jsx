import { useState } from 'react'
import Alert from '../../components/form/Alert'
import Button from '../../components/form/Button'
import Input from '../../components/form/Input'
import Select from '../../components/form/Select'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'
import { DAYS, SCHEDULE_ROWS } from '../../data/mockSchedule'
import { isRequired } from '../../utils/validators'

function FieldLabel({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon name={icon} className="size-3.5 text-base-content/45" />
      {children}
    </span>
  )
}

export default function LessonFormModal({
  open,
  lesson,
  defaultDay,
  defaultTimeSlot,
  defaultGroupId,
  lessons,
  groups,
  subjects,
  teachers,
  onClose,
  onSubmit,
  onDeleteRequest,
}) {
  const [groupId, setGroupId] = useState(lesson?.groupId ?? defaultGroupId ?? groups[0]?.id ?? '')
  const [subjectId, setSubjectId] = useState(lesson?.subjectId ?? '')
  const [teacherId, setTeacherId] = useState(lesson?.teacherId ?? '')
  const [room, setRoom] = useState(lesson?.room ?? '')
  const [day, setDay] = useState(lesson?.day ?? defaultDay ?? DAYS[0].key)

  const initialTimeSlot = lesson?.timeSlot ?? defaultTimeSlot ?? SCHEDULE_ROWS[0].timeSlot
  const matchedRow = SCHEDULE_ROWS.find((r) => r.timeSlot === initialTimeSlot)
  // Agar dars eski (SCHEDULE_ROWS'da yo'q) vaqtga ega bo'lsa, uni ro'yxatga
  // qo'shamiz — aks holda ochilganda vaqti sezilmasdan almashtirilib qo'yiladi.
  const [rowOptions] = useState(() =>
    matchedRow ? SCHEDULE_ROWS : [...SCHEDULE_ROWS, { key: initialTimeSlot, label: null, timeSlot: initialTimeSlot }],
  )
  const [scheduleRowKey, setScheduleRowKey] = useState(matchedRow?.key ?? initialTimeSlot)
  const timeSlot = rowOptions.find((r) => r.key === scheduleRowKey)?.timeSlot ?? initialTimeSlot

  const [errors, setErrors] = useState({})
  const [conflicts, setConflicts] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!isRequired(groupId)) nextErrors.groupId = 'Guruhni tanlang'
    if (!isRequired(subjectId)) nextErrors.subjectId = 'Modulni tanlang'
    if (!isRequired(teacherId)) nextErrors.teacherId = "O'qituvchini tanlang"
    if (!isRequired(room)) nextErrors.room = 'Xonani kiriting'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const otherLessons = lessons.filter((l) => l.id !== lesson?.id)
    const nextConflicts = []

    const teacherClash = otherLessons.find(
      (l) => l.day === day && l.timeSlot === timeSlot && l.teacherId === Number(teacherId),
    )
    if (teacherClash) {
      const clashGroup = groups.find((g) => g.id === teacherClash.groupId)
      nextConflicts.push(`Bu o'qituvchi shu vaqtda "${clashGroup?.name}" guruhida band`)
    }

    const roomClash = otherLessons.find(
      (l) =>
        l.day === day &&
        l.timeSlot === timeSlot &&
        l.room.trim().toLowerCase() === room.trim().toLowerCase(),
    )
    if (roomClash) nextConflicts.push(`"${room}" xonasi shu vaqtda band`)

    const groupClash = otherLessons.find(
      (l) => l.day === day && l.timeSlot === timeSlot && l.groupId === Number(groupId),
    )
    if (groupClash) nextConflicts.push('Bu guruhning shu vaqtda boshqa darsi bor')

    if (nextConflicts.length > 0) {
      setConflicts(nextConflicts)
      return
    }

    setConflicts([])
    setIsSubmitting(true)
    try {
      await onSubmit({
        id: lesson?.id,
        groupId: Number(groupId),
        subjectId: Number(subjectId),
        teacherId: Number(teacherId),
        room: room.trim(),
        day,
        timeSlot,
      })
    } catch (err) {
      setConflicts([err.message ?? "Saqlashda xatolik yuz berdi"])
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={lesson ? 'Darsni tahrirlash' : "Dars qo'shish"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        {conflicts.length > 0 && (
          <Alert variant="error" icon="alertTriangle">
            <ul className="list-disc space-y-0.5 pl-4">
              {conflicts.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Select
            label={<FieldLabel icon="calendar">Kun</FieldLabel>}
            value={day}
            onChange={setDay}
            options={DAYS.map((d) => ({ value: d.key, label: d.label }))}
          />
          <Select
            label={<FieldLabel icon="clock">Vaqt</FieldLabel>}
            value={scheduleRowKey}
            onChange={setScheduleRowKey}
            options={rowOptions.map((r) => ({
              value: r.key,
              label: r.label ? `${r.label} (${r.timeSlot})` : `Eski jadval (${r.timeSlot})`,
            }))}
          />
        </div>

        <Select
          label={<FieldLabel icon="group">Guruh</FieldLabel>}
          value={groupId}
          onChange={setGroupId}
          error={errors.groupId}
          options={groups.map((g) => ({ value: g.id, label: g.name }))}
        />

        <Select
          label={<FieldLabel icon="book">Modul</FieldLabel>}
          value={subjectId}
          onChange={setSubjectId}
          error={errors.subjectId}
          options={[
            { value: '', label: 'Tanlang' },
            ...subjects.map((s) => ({ value: s.id, label: s.name })),
          ]}
        />

        <Select
          label={<FieldLabel icon="user">O'qituvchi</FieldLabel>}
          value={teacherId}
          onChange={setTeacherId}
          error={errors.teacherId}
          options={[
            { value: '', label: 'Tanlang' },
            ...teachers.map((t) => ({ value: t.id, label: t.fullName })),
          ]}
        />

        <Input
          label={<FieldLabel icon="mapPin">Xona</FieldLabel>}
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          error={errors.room}
          placeholder="204-xona"
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          {lesson ? (
            <Button type="button" variant="danger" onClick={() => onDeleteRequest(lesson)} disabled={isSubmitting}>
              O'chirish
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Saqlash'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
