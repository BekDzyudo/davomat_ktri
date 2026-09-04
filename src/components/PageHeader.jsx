import Icon from './Icon'

export default function PageHeader({ title, description, actions, back, icon }) {
  return (
    <div className="relative -mx-4 -mt-4 mb-6 min-h-38 overflow-hidden rounded-b-3xl bg-fixed lg:-mx-6 lg:-mt-6 bg-[url(/bino.png)] bg-cover bg-position-[center_100%]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[oklch(45%_0.18_231)]/85 via-[oklch(48%_0.14_210)]/45 to-[oklch(52%_0.14_190)]/85" />
      <div className="relative flex h-full min-h-38 flex-col justify-center gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 lg:px-8">
        <div className="min-w-0">
          {back}
          <div className="flex items-center gap-2.5">
            {icon && (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white sm:size-9">
                <Icon name={icon} className="size-4 sm:size-5" />
              </span>
            )}
            <h1 className="truncate text-xl font-black uppercase tracking-wide text-white drop-shadow-sm sm:text-2xl">
              {title}
            </h1>
          </div>
          {description && <p className="mt-1 text-sm text-white/85">{description}</p>}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-2xl bg-white/95 p-2 shadow-lg">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
