import Icon from './Icon'

const VARIANT_STYLE = {
  success: { tone: 'bg-success text-success-content', icon: 'badgeCheck' },
  error: { tone: 'bg-error text-error-content', icon: 'alertCircle' },
  warning: { tone: 'bg-warning text-warning-content', icon: 'alertTriangle' },
}

// Ekran o'rtasida ko'rinadigan bildirishnoma (masalan "Davomat saqlandi" yoki
// xatolik xabari) — sahifa ichidagi kichik banner o'rniga, e'tibor tortadigan
// modal-uslubdagi popup sifatida. src/context/ToastContext.jsx tomonidan
// boshqariladi (avtomatik yopilish vaqti ham o'sha yerda).
export default function CenterToast({ open, message, details, variant = 'success', onClose }) {
  if (!open || !message) return null
  const style = VARIANT_STYLE[variant] ?? VARIANT_STYLE.success

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Yopish"
        onClick={onClose}
        className="absolute inset-0 bg-neutral/40 backdrop-blur-[2px]"
      />
      <div
        role="status"
        className={`animate-toast-pop relative flex w-full max-w-lg items-start gap-4 rounded-3xl px-7 py-6 shadow-2xl ${style.tone}`}
      >
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Icon name={style.icon} className="size-7" />
        </span>
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-lg font-bold leading-snug">{message}</p>
          {details && <p className="mt-1 text-sm opacity-85">{details}</p>}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-current/80 transition-colors hover:bg-white/20"
          >
            <Icon name="x" className="size-4.5" />
          </button>
        )}
      </div>
    </div>
  )
}
