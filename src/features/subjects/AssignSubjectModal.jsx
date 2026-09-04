import { useState } from 'react'
import Button from '../../components/form/Button'
import Select from '../../components/form/Select'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'

const LESSON_TYPE_OPTIONS = [
  { value: 'theory', label: 'Nazariy' },
  { value: 'practice', label: 'Amaliy' },
  { value: 'mixed', label: 'Aralash' },
]
const LESSON_TYPE_LABELS = Object.fromEntries(LESSON_TYPE_OPTIONS.map((o) => [o.value, o.label]))

export default function AssignSubjectModal({
  open,
  subject,
  assignments,
  teachers,
  groups,
  onClose,
  onAdd,
  onRemove,
}) {
  const [teacherId, setTeacherId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [lessonType, setLessonType] = useState('mixed')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [error, setError] = useState('')

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!teacherId || !groupId) {
      setError("O'qituvchi va guruhni tanlang")
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await onAdd({ subjectId: subject.id, teacherId: Number(teacherId), groupId: Number(groupId), lessonType })
      setTeacherId('')
      setGroupId('')
    } catch (err) {
      setError(err.message ?? "Biriktirishda xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemove = async (id) => {
    setRemovingId(id)
    try {
      await onRemove(id)
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`"${subject.name}" — biriktirish`}>
      <div className="flex flex-col gap-4">
        <div>
          <span className="text-sm font-medium text-base-content">Mavjud biriktirishlar</span>
          <div className="mt-2 flex flex-col gap-1.5">
            {assignments.length === 0 && (
              <p className="text-sm text-base-content/50">Hali hech kim biriktirilmagan</p>
            )}
            {assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between gap-2 rounded-box border border-base-300 bg-base-200/50 px-3 py-2"
              >
                <span className="text-sm text-base-content">
                  {a.teacherName} <span className="text-base-content/40">·</span> {a.groupName}
                  {a.lessonType && (
                    <>
                      {' '}
                      <span className="text-base-content/40">·</span>{' '}
                      <span className="text-base-content/60">{LESSON_TYPE_LABELS[a.lessonType] ?? a.lessonType}</span>
                    </>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(a.id)}
                  disabled={removingId === a.id}
                  className="flex size-7 items-center justify-center rounded-lg text-base-content/60 transition-colors hover:bg-error/10 hover:text-error disabled:opacity-50"
                  aria-label="O'chirish"
                >
                  <Icon name="trash" className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col gap-3 border-t border-base-300 pt-4">
          <span className="text-sm font-medium text-base-content">Yangi biriktirish</span>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="O'qituvchi"
              value={teacherId}
              onChange={setTeacherId}
              options={[
                { value: '', label: 'Tanlang' },
                ...teachers.map((t) => ({ value: t.id, label: t.fullName })),
              ]}
            />
            <Select
              label="Guruh"
              value={groupId}
              onChange={setGroupId}
              options={[
                { value: '', label: 'Tanlang' },
                ...groups.map((g) => ({ value: g.id, label: g.name })),
              ]}
            />
          </div>
          <Select label="Dars turi" value={lessonType} onChange={setLessonType} options={LESSON_TYPE_OPTIONS} />
          {error && <p className="text-sm text-error">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Yopish
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : "Qo'shish"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
