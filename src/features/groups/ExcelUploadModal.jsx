import { useEffect, useRef, useState } from 'react'
import Alert from '../../components/form/Alert'
import Button from '../../components/form/Button'
import ExcelUploadResult from '../../components/ExcelUploadResult'
import Icon from '../../components/Icon'
import Modal from '../../components/Modal'
import { downloadCsv } from '../../utils/csv'

const SAMPLE_ROWS = [
  { fullName: 'Aliyev Vali Aliyevich', phone: '+998901234567', institution: 'Namangan tuman 5-son texnikumi' },
  { fullName: 'Boynazarov Xasan', phone: '+998995039507', institution: 'Namangan shahar 3-son kasb-hunar maktabi' },
  { fullName: 'Djamaliddinova Maxfuza', phone: '+998948095051', institution: 'Namangan tuman 5-son texnikumi' },
]

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv']

function isAcceptedFile(file) {
  const name = file?.name?.toLowerCase() ?? ''
  return ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

function downloadSampleCsv() {
  downloadCsv(
    'namuna-tinglovchilar.csv',
    ['F.I.Sh', 'Telefon', "Ta'lim muassasa nomi"],
    SAMPLE_ROWS.map((r) => [r.fullName, r.phone, r.institution]),
  )
}

export default function ExcelUploadModal({ open, onClose, onUpload }) {
  const [file, setFile] = useState(null)
  const [showSample, setShowSample] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const [rowErrors, setRowErrors] = useState([])
  const [rowWarnings, setRowWarnings] = useState([])
  const [success, setSuccess] = useState(false)
  const closeTimerRef = useRef(null)

  useEffect(() => () => clearTimeout(closeTimerRef.current), [])

  const handleClose = () => {
    clearTimeout(closeTimerRef.current)
    setFile(null)
    setShowSample(false)
    setIsDragging(false)
    setError('')
    setRowErrors([])
    setRowWarnings([])
    setSuccess(false)
    onClose()
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    setError('')
    setRowErrors([])
    try {
      const result = await onUpload(file)
      const warnings = result?.warnings ?? []
      setRowWarnings(warnings)
      setSuccess(true)
      // Ogohlantirish bo'lmasa avvalgidek tez yopiladi; bo'lsa — foydalanuvchi
      // o'qib chiqishi uchun avtomatik yopilmaydi, o'zi "Yopish"ni bosadi.
      if (warnings.length === 0) {
        closeTimerRef.current = setTimeout(handleClose, 1200)
      }
    } catch (err) {
      // Backend qator-qator xatoliklarni `{"errors": [{"row", "error"}, ...]}`
      // shaklida qaytaradi (admin panelida ko'rsatilgani bilan bir xil) —
      // shu tafsilotlarni ham ko'rsatamiz, faqat umumiy xabar bilan cheklanmaymiz.
      if (Array.isArray(err.data?.errors) && err.data.errors.length > 0) {
        setRowErrors(err.data.errors)
        setError(err.data.detail || 'Faylda xatoliklar topildi.')
      } else {
        setError(err.message ?? 'Faylni yuklashda xatolik yuz berdi')
      }
    } finally {
      setIsUploading(false)
    }
  }

  const pickFile = (candidate) => {
    if (!candidate) return
    if (!isAcceptedFile(candidate)) {
      setError('Fayl formati noto\'g\'ri. .xlsx, .xls yoki .csv fayl tanlang')
      return
    }
    setError('')
    setRowErrors([])
    setFile(candidate)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    pickFile(e.dataTransfer.files?.[0] ?? null)
  }

  return (
    <Modal open={open} onClose={handleClose} title="Excel orqali yuklash">
      {success ? (
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
            <Icon name="badgeCheck" className="size-8" />
          </span>
          <p className="text-sm font-medium text-base-content">Guruh a'zolari muvaffaqiyatli yuklandi!</p>
          {rowWarnings.length > 0 && (
            <div className="w-full text-left">
              <ExcelUploadResult warnings={rowWarnings} />
            </div>
          )}
          <Button type="button" onClick={handleClose} className="w-full">
            Yopish
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="rounded-box border border-base-300 bg-base-200/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-base-content">Namuna format</p>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowSample((v) => !v)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {showSample ? 'Yashirish' : "Ko'rish"}
                </button>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="group inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <Icon
                    name="download"
                    className="size-3.5 transition-transform duration-200 group-hover:translate-y-0.5"
                  />
                  Yuklab olish
                </button>
              </div>
            </div>

            {showSample && (
              <div className="mt-3 overflow-x-auto rounded-box border border-base-300">
                <table className="table table-xs">
                  <thead>
                    <tr className="text-[11px] uppercase text-base-content/50">
                      <th className="w-8">#</th>
                      <th>F.I.Sh</th>
                      <th>Telefon</th>
                      <th>Ta'lim muassasa nomi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_ROWS.map((row, index) => (
                      <tr key={row.fullName}>
                        <td className="text-base-content/40">{index + 1}</td>
                        <td className="text-base-content/80">{row.fullName}</td>
                        <td className="text-base-content/70">{row.phone}</td>
                        <td className="text-base-content/70">{row.institution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`group flex cursor-pointer flex-col items-center gap-2 rounded-box border-2 border-dashed px-4 py-10 text-center transition-colors duration-200 ${
              isDragging
                ? 'border-success bg-success/10'
                : 'border-base-300 hover:border-success/40 hover:bg-success/5'
            }`}
          >
            <Icon
              name="fileSpreadsheet"
              className="size-8 text-base-content/60 transition-all duration-200 group-hover:scale-110 group-hover:text-success"
            />
            <span className="text-sm font-medium text-base-content">
              {file ? file.name : "Faylni shu yerga tashlang yoki tanlash uchun bosing"}
            </span>
            <span className="text-xs text-base-content/50">.xlsx, .xls yoki .csv</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            />
          </label>

          {rowErrors.length > 0 ? (
            <ExcelUploadResult errors={rowErrors} />
          ) : (
            error && <Alert variant="error">{error}</Alert>
          )}

          {isUploading && (
            <p className="flex items-center gap-2 text-xs text-base-content/50">
              <span className="loading loading-spinner loading-xs shrink-0" />
              Fayl serverga yuklanmoqda va tinglovchilar qo'shilmoqda, iltimos kuting...
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isUploading}>
              Bekor qilish
            </Button>
            <Button type="button" onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Yuklanmoqda...
                </>
              ) : (
                'Yuklash'
              )}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
