const VARIANTS = {
  primary:
    'border-none bg-linear-to-r from-primary to-secondary text-primary-content shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-105 active:scale-[0.98]',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn-error',
}

export default function Button({
  variant = 'primary',
  className = '',
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      className={['btn group', VARIANTS[variant] ?? VARIANTS.primary, className].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="loading loading-spinner loading-sm" />}
      {children}
    </button>
  )
}
