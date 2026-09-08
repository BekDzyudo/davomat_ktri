import Icon from './Icon'

/**
 * Excel import natijasini (qatorma-qator xatolik/ogohlantirish) ko'rsatadi —
 * backend `{"row": N, "error": "..."}` / `{"row": N, "warning": "..."}` shaklida
 * qaytaradi (`apps/groups/excel_import.py`ga qarang), admin panelidagi
 * `messages.error`/`messages.warning` bilan bir xil ma'lumot shu yerda ko'rinadi.
 */
export default function ExcelUploadResult({ errors = [], warnings = [], successMessage }) {
  if (!errors.length && !warnings.length && !successMessage) return null

  return (
    <div className="flex flex-col gap-3">
      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-box border border-success/30 bg-success/10 px-3.5 py-2.5 text-sm text-success">
          <Icon name="badgeCheck" className="size-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="rounded-box border border-warning/30 bg-warning/10 p-3.5">
          <div className="flex items-center gap-2 text-sm font-medium text-warning">
            <Icon name="alertCircle" className="size-4 shrink-0" />
            <span>Ogohlantirishlar ({warnings.length})</span>
          </div>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-warning/90">
            {warnings.map((w) => (
              <li key={`${w.row}-${w.warning}`}>
                {w.row}-qatorda: {w.warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {errors.length > 0 && (
        <div className="rounded-box border border-error/30 bg-error/10 p-3.5">
          <div className="flex items-center gap-2 text-sm font-medium text-error">
            <Icon name="alertTriangle" className="size-4 shrink-0" />
            <span>Xatoliklar ({errors.length})</span>
          </div>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-error/90">
            {errors.map((err) => (
              <li key={`${err.row}-${err.error}`}>
                {err.row}-qatorda: {err.error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
