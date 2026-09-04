import Icon from '../Icon'

const VARIANT_STYLES = {
  error: 'border-error/30 bg-error/10 text-error',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  success: 'border-success/30 bg-success/10 text-success',
}

export default function Alert({ variant = 'error', icon, children }) {
  if (!children) return null

  return (
    <div
      role="alert"
      className={[
        'flex items-start gap-2.5 rounded-box border px-3.5 py-2.5 text-sm',
        VARIANT_STYLES[variant] ?? VARIANT_STYLES.error,
      ].join(' ')}
    >
      {icon && <Icon name={icon} className="mt-0.5 size-4 shrink-0" />}
      <span>{children}</span>
    </div>
  )
}
