import { useState } from 'react'
import Button from '../../components/form/Button'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'
import { isRequired } from '../../utils/validators'

export default function ExcuseModal({ student, initialReason, initialFileName, onClose, onConfirm }) {
  const [reason, setReason] = useState(initialReason ?? '')
  const [fileName, setFileName] = useState(initialFileName ?? '')
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!isRequired(reason)) {
      setError('Sababni kiriting')
      return
    }
    onConfirm({ reason: reason.trim(), fileName, file })
  }

  return (
    <Modal open onClose={onClose} title="Sababli deb belgilash" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <p className="text-sm text-base-content/60">
          <span className="font-medium text-base-content">{student.fullName}</span> uchun sababni
          kiriting
        </p>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-base-content">Sabab</label>
          <textarea
            value={reason}
            onChange={(e) => {
              setReason(e.target.value)
              setError('')
            }}
            rows={3}
            placeholder="Masalan: kasallik tufayli"
            className="w-full rounded-xl border border-base-300 bg-base-100 p-3 text-sm text-base-content shadow-sm outline-none transition-all placeholder:text-base-content/40 hover:border-base-content/20 focus:border-primary/40 focus:shadow-md focus:ring-4 focus:ring-primary/10"
          />
          {error && <p className="text-sm text-error">{error}</p>}
        </div>

        <label className="group flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-base-300 px-3 py-2.5 text-sm text-base-content/70 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/5">
          <Icon
            name="upload"
            className="size-4 shrink-0 text-base-content/60 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:text-primary"
          />
          <span className="truncate">{fileName || 'Spravka (fayl) biriktirish — ixtiyoriy'}</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const picked = e.target.files?.[0] ?? null
              setFile(picked)
              setFileName(picked?.name ?? '')
            }}
          />
        </label>

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit">Tasdiqlash</Button>
        </div>
      </form>
    </Modal>
  )
}
