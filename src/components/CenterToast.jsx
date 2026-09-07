import Icon from './Icon'

const VARIANT_TONE = {
  success: 'bg-success text-success-content',
  error: 'bg-error text-error-content',
}

// Ekran o'rtasida qisqa muddat ko'rinadigan bildirishnoma (masalan "Davomat
// saqlandi") — sahifa ichidagi kichik banner o'rniga, e'tibor tortadigan
// popup sifatida. Ko'rinish/yashirilishini chaqiruvchi (`open` propi orqali,
// odatda setTimeout bilan) boshqaradi; `onClose` berilsa, qo'lda ham
// (X tugmasi bilan) yopish mumkin bo'ladi.
export default function CenterToast({ open, message, details, icon = 'badgeCheck', variant = 'success', onClose }) {
  if (!open || !message) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-70 flex items-center justify-center p-4">
      <div
        role="status"
        className={`animate-toast-pop pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl px-6 py-4 shadow-2xl ${
          VARIANT_TONE[variant] ?? VARIANT_TONE.success
        }`}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Icon name={icon} className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-semibold">{message}</p>
          {details && <p className="mt-0.5 text-sm opacity-85">{details}</p>}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-full text-current/80 transition-colors hover:bg-white/20"
          >
            <Icon name="x" className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
