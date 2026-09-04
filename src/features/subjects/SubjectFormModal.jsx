import { useState } from 'react'
import Alert from '../../components/form/Alert'
import Button from '../../components/form/Button'
import Input from '../../components/form/Input'
import Select from '../../components/form/Select'
import Modal from '../../components/Modal'
import { isRequired } from '../../utils/validators'

const SUBJECT_TYPE_OPTIONS = [
  { value: 'theory', label: 'Nazariy' },
  { value: 'practice', label: 'Amaliy' },
  { value: 'mixed', label: 'Aralash' },
]

export default function SubjectFormModal({ open, mode, initialValue, onClose, onSubmit }) {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [code, setCode] = useState(initialValue?.code ?? '')
  const [theoryHours, setTheoryHours] = useState(initialValue?.theoryHours ?? 0)
  const [practiceHours, setPracticeHours] = useState(initialValue?.practiceHours ?? 0)
  const [subjectType, setSubjectType] = useState(initialValue?.subjectType ?? 'theory')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!isRequired(name)) nextErrors.name = "Bu maydonni to'ldiring"
    if (!isRequired(code)) nextErrors.code = "Bu maydonni to'ldiring"
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitError('')
    setIsSubmitting(true)
    try {
      await onSubmit({
        id: initialValue?.id,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        theoryHours: Number(theoryHours) || 0,
        practiceHours: Number(practiceHours) || 0,
        subjectType,
      })
    } catch (err) {
      setSubmitError(err.message ?? "Saqlashda xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  const total = (Number(theoryHours) || 0) + (Number(practiceHours) || 0)

  return (
    <Modal open={open} onClose={onClose} title={mode === 'edit' ? 'Modulni tahrirlash' : 'Yangi modul'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="Modul nomi" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <Input
          label="Modul kodi"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          error={errors.code}
          placeholder="CS101"
        />
        <Select label="Turi" value={subjectType} onChange={setSubjectType} options={SUBJECT_TYPE_OPTIONS} />
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            min="0"
            label="Nazariy soat"
            value={theoryHours}
            onChange={(e) => setTheoryHours(e.target.value)}
          />
          <Input
            type="number"
            min="0"
            label="Amaliy soat"
            value={practiceHours}
            onChange={(e) => setPracticeHours(e.target.value)}
          />
        </div>
        <p className="text-sm text-base-content/60">
          Jami soat: <span className="font-medium text-base-content">{total}</span>
        </p>

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
