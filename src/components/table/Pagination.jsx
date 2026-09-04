import Icon from '../Icon'

export default function Pagination({ page, totalPages, onChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null

  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-base-300 pt-4 sm:flex-row">
      <p className="text-xs text-base-content/60">
        {totalItems} tadan {from}-{to} ko'rsatilmoqda
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="group flex size-8 items-center justify-center rounded-box text-base-content/60 transition-colors duration-200 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
          aria-label="Oldingi sahifa"
        >
          <Icon
            name="chevronLeft"
            className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={[
              'flex size-8 items-center justify-center rounded-box text-sm font-medium transition-colors',
              n === page
                ? 'bg-primary text-primary-content'
                : 'text-base-content/70 hover:bg-base-200',
            ].join(' ')}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="group flex size-8 items-center justify-center rounded-box text-base-content/60 transition-colors duration-200 hover:bg-primary/10 hover:text-primary disabled:pointer-events-none disabled:opacity-30"
          aria-label="Keyingi sahifa"
        >
          <Icon
            name="chevronRight"
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </div>
  )
}
