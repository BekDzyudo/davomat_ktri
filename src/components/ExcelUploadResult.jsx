import Icon from './Icon'

export default function ExcelUploadResult({ result }) {
  if (!result) return null

  const { totalRows, successCount, errors } = result

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5 rounded-box border border-success/30 bg-success/10 px-3.5 py-2.5 text-sm text-success">
        <Icon name="badgeCheck" className="size-4 shrink-0" />
        <span>
          {totalRows} qatordan <strong>{successCount}</strong> tasi muvaffaqiyatli yuklandi
        </span>
      </div>

      {errors.length > 0 && (
        <div className="rounded-box border border-error/30 bg-error/10 p-3.5">
          <div className="flex items-center gap-2 text-sm font-medium text-error">
            <Icon name="alertTriangle" className="size-4 shrink-0" />
            <span>Xatoliklar ({errors.length})</span>
          </div>
          <ul className="mt-2 space-y-1 text-sm text-error/90">
            {errors.map((err) => (
              <li key={err.row}>
                {err.row}-qatorda: {err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
