import { useState } from 'react'
import Alert from '../../components/form/Alert'
import Button from '../../components/form/Button'
import Input from '../../components/form/Input'
import Modal from '../../components/Modal'
import { isRequired } from '../../utils/validators'

export default function FacultyFormModal({ open, mode, initialValue, onClose, onSubmit }) {
  const [name, setName] = useState(initialValue?.name ?? '')
  const [error, setError] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!isRequired(name)) {
      setError("Bu maydonni to'ldiring")
      return
    }
    setError('')
    setSubmitError('')
    setIsSubmitting(true)
    try {
      await onSubmit({ id: initialValue?.id, name: name.trim() })
    } catch (err) {
      setSubmitError(err.message ?? "Saqlashda xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={mode === 'edit' ? 'Fakultetni tahrirlash' : 'Yangi fakultet'} size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="Fakultet nomi" value={name} onChange={(e) => setName(e.target.value)} error={error} />

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
