import Icon from '../Icon'

export default function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="group/search relative w-full sm:max-w-xs">
      <Icon
        name="search"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-base-content/35 transition-colors group-focus-within/search:text-primary"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-base-300 bg-base-100 py-2.5 pl-10 pr-9 text-sm text-base-content shadow-sm outline-none transition-all placeholder:text-base-content/40 hover:border-base-content/20 focus:border-primary/40 focus:shadow-md focus:ring-4 focus:ring-primary/10"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="group/clear absolute right-2.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full text-base-content/40 transition-colors duration-200 hover:bg-error/10 hover:text-error"
          aria-label="Tozalash"
        >
          <Icon
            name="x"
            className="size-3.5 transition-transform duration-200 group-hover/clear:rotate-90"
          />
        </button>
      )}
    </div>
  )
}
