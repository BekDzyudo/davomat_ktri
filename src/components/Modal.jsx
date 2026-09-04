import Icon from './Icon'

const WIDTHS = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

export default function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative max-h-[calc(100vh-2rem)] w-full overflow-y-auto rounded-box border border-base-300 bg-base-100 p-6 shadow-xl ${WIDTHS[size]}`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-base-content">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="group flex size-8 items-center justify-center rounded-box text-base-content/50 transition-colors duration-200 hover:bg-error/10 hover:text-error"
            aria-label="Yopish"
          >
            <Icon
              name="x"
              className="size-4 transition-transform duration-200 group-hover:rotate-90"
            />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
