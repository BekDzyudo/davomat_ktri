import { useId, useState } from 'react'
import Icon from '../Icon'
import FormError from './FormError'

export default function Input({
  label,
  error,
  type = 'text',
  id,
  className = '',
  ...props
}) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && revealed ? 'text' : type

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-base-content">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          className={[
            'w-full rounded-xl border bg-base-100 py-2.5 px-3.5 text-sm text-base-content shadow-sm outline-none transition-all placeholder:text-base-content/40',
            isPassword ? 'pr-11' : '',
            error
              ? 'border-error focus:ring-4 focus:ring-error/10'
              : 'border-base-300 hover:border-base-content/20 focus:border-primary/40 focus:shadow-md focus:ring-4 focus:ring-primary/10',
            className,
          ].join(' ')}
          aria-invalid={!!error}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            tabIndex={-1}
            className="group absolute inset-y-0 right-0 flex w-11 items-center justify-center text-base-content/70 transition-colors duration-200 hover:text-primary"
            aria-label={revealed ? 'Parolni yashirish' : "Parolni ko'rsatish"}
          >
            <Icon
              name={revealed ? 'eyeOff' : 'eye'}
              className="size-5 transition-transform duration-200 group-hover:scale-110"
            />
          </button>
        )}
      </div>
      <FormError>{error}</FormError>
    </div>
  )
}
