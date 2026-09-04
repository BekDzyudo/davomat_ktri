import Dropdown from '../Dropdown'

export default function FilterSelect({ value, onChange, options, className = '' }) {
  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={options}
      triggerClassName={`flex w-full items-center justify-between gap-2 rounded-xl border border-base-300 bg-base-100 py-2.5 px-4 text-sm text-base-content shadow-sm outline-none transition-all hover:border-base-content/20 focus:border-primary/40 focus:shadow-md focus:ring-4 focus:ring-primary/10 ${className}`}
    />
  )
}
