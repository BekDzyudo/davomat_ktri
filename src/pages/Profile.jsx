import { useRef, useState } from 'react'
import { changePassword, updateMe, uploadMyPhoto } from '../api/auth'
import { ApiError } from '../api/client'
import Alert from '../components/form/Alert'
import Button from '../components/form/Button'
import Input from '../components/form/Input'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { ROLE_LABELS } from '../data/roles'
import { isRequired } from '../utils/validators'

function ProfileCard() {
  const { currentUser, setCurrentUser } = useAuth()
  const fileInputRef = useRef(null)

  const [fullName, setFullName] = useState(currentUser.fullName ?? '')
  const [phone, setPhone] = useState(currentUser.phone ?? '')
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!isRequired(fullName)) nextErrors.fullName = "Bu maydonni to'ldiring"
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSaving(true)
    setSaveError('')
    setSaved(false)
    try {
      const updated = await updateMe({ fullName: fullName.trim(), phone: phone.trim() })
      setCurrentUser(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Saqlashda xatolik yuz berdi")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsUploadingPhoto(true)
    setPhotoError('')
    try {
      const updated = await uploadMyPhoto(file)
      setCurrentUser(updated)
    } catch (err) {
      setPhotoError(err instanceof ApiError ? err.message : "Rasmni yuklashda xatolik yuz berdi")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-4">
        <div className="group relative shrink-0">
          <div className="avatar avatar-placeholder">
            <div className="w-16 overflow-hidden rounded-full bg-primary text-primary-content">
              {currentUser.photo ? (
                <img src={currentUser.photo} alt={currentUser.fullName} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl">{currentUser.fullName?.[0] ?? '?'}</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full border-2 border-base-100 bg-primary text-primary-content shadow-sm transition-transform duration-200 hover:scale-110 disabled:opacity-60"
            aria-label="Rasmni almashtirish"
          >
            {isUploadingPhoto ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Icon name="camera" className="size-3.5" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-base-content">{currentUser.fullName}</h2>
          <p className="text-sm text-base-content/60">{ROLE_LABELS[currentUser.role]}</p>
        </div>
      </div>

      {photoError && (
        <div className="mb-4">
          <Alert variant="error">{photoError}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Login" value={currentUser.username} disabled />
          <Input label="Email" value={currentUser.email || '—'} disabled />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="F.I.Sh"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
          />
          <Input
            label="Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+998 90 123 45 67"
          />
        </div>

        {saveError && <Alert variant="error">{saveError}</Alert>}
        {saved && (
          <Alert variant="success" icon="badgeCheck">
            Profil muvaffaqiyatli saqlandi.
          </Alert>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <span className="loading loading-spinner loading-sm" /> : 'Saqlash'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function ChangePasswordCard() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const nextErrors = {}
    if (!isRequired(oldPassword)) nextErrors.oldPassword = "Bu maydonni to'ldiring"
    if (!isRequired(newPassword)) {
      nextErrors.newPassword = "Bu maydonni to'ldiring"
    } else if (newPassword.length < 6) {
      nextErrors.newPassword = "Parol kamida 6 ta belgidan iborat bo'lishi kerak"
    }
    if (confirmPassword !== newPassword) nextErrors.confirmPassword = 'Parollar mos kelmadi'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSaving(true)
    setSaveError('')
    setSaved(false)
    try {
      await changePassword({ oldPassword, newPassword })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Saqlashda xatolik yuz berdi")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-base-content">Parolni almashtirish</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          type="password"
          label="Joriy parol"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          error={errors.oldPassword}
          autoComplete="current-password"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="password"
            label="Yangi parol"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={errors.newPassword}
            autoComplete="new-password"
          />
          <Input
            type="password"
            label="Yangi parolni takrorlang"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
        </div>

        {saveError && <Alert variant="error">{saveError}</Alert>}
        {saved && (
          <Alert variant="success" icon="badgeCheck">
            Parol muvaffaqiyatli o'zgartirildi.
          </Alert>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <span className="loading loading-spinner loading-sm" /> : "O'zgartirish"}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function Profile() {
  return (
    <div>
      <PageHeader title="Mening profilim" icon="user" />
      <div className="flex flex-col gap-4">
        <ProfileCard />
        <ChangePasswordCard />
      </div>
    </div>
  )
}
