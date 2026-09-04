import { useState } from 'react'
import Alert from '../../components/form/Alert'
import Button from '../../components/form/Button'
import Input from '../../components/form/Input'
import Modal from '../../components/Modal'
import { isRequired, isValidPhone } from '../../utils/validators'

export default function StudentFormModal({ open, onClose, onSubmit }) {
  const [fullName, setFullName] = useState('')
  const [externalId, setExternalId] = useState('')
  const [phone, setPhone] = useState('')
  const [institution, setInstitution] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!isRequired(fullName)) nextErrors.fullName = "Bu maydonni to'ldiring"
    if (!isRequired(externalId)) nextErrors.externalId = "Bu maydonni to'ldiring"
    if (phone && !isValidPhone(phone)) nextErrors.phone = "Telefon raqami noto'g'ri"
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitError('')
    setIsSubmitting(true)
    try {
      await onSubmit({
        fullName: fullName.trim(),
        externalId: externalId.trim(),
        phone: phone.trim(),
        institution: institution.trim(),
        isActive: true,
      })
    } catch (err) {
      setSubmitError(err.message ?? "Qo'shishda xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Tinglovchi qo'shish" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="F.I.Sh"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />
        <Input
          label="ID raqam"
          value={externalId}
          onChange={(e) => setExternalId(e.target.value)}
          error={errors.externalId}
          placeholder="12345"
        />
        <Input
          label="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          placeholder="93-598-22-51"
        />
        <Input
          label="Ta'lim muassasasi nomi"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="Namangan tuman 5-son texnikumi"
        />

        {submitError && <Alert variant="error">{submitError}</Alert>}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Bekor qilish
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : "Qo'shish"}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
