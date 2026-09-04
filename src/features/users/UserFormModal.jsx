import { useState } from 'react'
import Alert from '../../components/form/Alert'
import Button from '../../components/form/Button'
import Input from '../../components/form/Input'
import Select from '../../components/form/Select'
import Modal from '../../components/Modal'
import { ROLE_LABELS, ROLES } from '../../data/roles'
import { isRequired, isValidPhone } from '../../utils/validators'

const ROLE_OPTIONS = Object.values(ROLES)

export default function UserFormModal({ open, mode, initialValue, onClose, onSubmit }) {
  const [fullName, setFullName] = useState(initialValue?.fullName ?? '')
  const [username, setUsername] = useState(initialValue?.username ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(initialValue?.role ?? ROLES.OQITUVCHI)
  const [phone, setPhone] = useState(initialValue?.phone ?? '')
  const [isActive, setIsActive] = useState(initialValue?.isActive ?? true)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEdit = mode === 'edit'

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!isRequired(fullName)) nextErrors.fullName = "Bu maydonni to'ldiring"
    if (!isRequired(username)) nextErrors.username = "Bu maydonni to'ldiring"
    if (!isEdit && !isRequired(password)) nextErrors.password = "Bu maydonni to'ldiring"
    if (phone && !isValidPhone(phone)) nextErrors.phone = "Telefon raqami noto'g'ri"
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSubmitError('')
    setIsSubmitting(true)
    try {
      await onSubmit({
        id: initialValue?.id,
        fullName: fullName.trim(),
        username: username.trim(),
        password,
        role,
        phone: phone.trim(),
        isActive,
      })
    } catch (err) {
      setSubmitError(err.message ?? "Saqlashda xatolik yuz berdi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Foydalanuvchini tahrirlash' : 'Yangi foydalanuvchi'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="F.I.Sh"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
        />
        <Input
          label="Login"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={errors.username}
          disabled={isEdit}
          autoComplete="off"
        />
        {!isEdit && (
          <Input
            type="password"
            label="Parol"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="new-password"
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Rol"
            value={role}
            onChange={setRole}
            options={ROLE_OPTIONS.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
          />
          <Select
            label="Holat"
            value={isActive ? 'faol' : 'nofaol'}
            onChange={(v) => setIsActive(v === 'faol')}
            options={[
              { value: 'faol', label: 'Faol' },
              { value: 'nofaol', label: 'Nofaol' },
            ]}
          />
        </div>
        <Input
          label="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
          placeholder="+998 90 123 45 67"
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
