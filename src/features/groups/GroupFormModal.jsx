import { useState } from 'react'
import Alert from '../../components/form/Alert'
import Button from '../../components/form/Button'
import Input from '../../components/form/Input'
import Select from '../../components/form/Select'
import Modal from '../../components/Modal'
import { isRequired } from '../../utils/validators'

export default function GroupFormModal({ open, mode, initialValue, faculties, onClose, onSubmit }) {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [direction, setDirection] = useState(initialValue?.direction ?? '')
  const [course, setCourse] = useState(initialValue?.course ?? 1)
  const [academicYear, setAcademicYear] = useState(initialValue?.academicYear ?? '2024-2025')
  const [facultyId, setFacultyId] = useState(initialValue?.faculty ?? '')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!isRequired(name)) nextErrors.name = "Bu maydonni to'ldiring"
    if (!isRequired(direction)) nextErrors.direction = "Bu maydonni to'ldiring"
    if (!isRequired(facultyId)) nextErrors.faculty = "Fakultetni tanlang"
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitError('')
    setIsSubmitting(true)
    try {
      await onSubmit({
        id: initialValue?.id,
        name: name.trim(),
        direction: direction.trim(),
        course: Number(course),
        academicYear,
        faculty: Number(facultyId),
      })
    } catch (err) {
      setSubmitError(err.message ?? "Saqlashda xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === 'edit' ? 'Guruhni tahrirlash' : 'Yangi guruh'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Guruh nomi"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          placeholder="AT-21-01"
        />
        <Input
          label="Yo'nalish"
          value={direction}
          onChange={(e) => setDirection(e.target.value)}
          error={errors.direction}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Kurs"
            value={course}
            onChange={setCourse}
            options={[1, 2, 3, 4].map((c) => ({ value: c, label: `${c}-kurs` }))}
          />
          <Input
            label="O'quv yili"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            placeholder="2024-2025"
          />
        </div>
        <Select
          label="Fakultet"
          value={facultyId}
          onChange={setFacultyId}
          error={errors.faculty}
          options={[
            { value: '', label: 'Tanlang' },
            ...faculties.map((f) => ({ value: f.id, label: f.name })),
          ]}
        />

        {submitError && <Alert variant="error">{submitError}</Alert>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Saqlash'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
