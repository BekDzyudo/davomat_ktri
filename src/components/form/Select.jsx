import { useId } from 'react'
import Dropdown from '../Dropdown'
import FormError from './FormError'

export default function Select({ label, error, id, className = '', options, value, onChange, placeholder }) {
  const generatedId = useId()
  const selectId = id ?? generatedId

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-base-content">
          {label}
        </label>
      )}
      <Dropdown
        id={selectId}
        value={value}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        triggerClassName={[
          'flex w-full items-center justify-between gap-2 rounded-xl border bg-base-100 py-2.5 px-3.5 text-sm text-base-content shadow-sm outline-none transition-all',
          error
            ? 'border-error focus:ring-4 focus:ring-error/10'
            : 'border-base-300 hover:border-base-content/20 focus:border-primary/40 focus:shadow-md focus:ring-4 focus:ring-primary/10',
          className,
        ].join(' ')}
      />
      <FormError>{error}</FormError>
    </div>
  )
}
