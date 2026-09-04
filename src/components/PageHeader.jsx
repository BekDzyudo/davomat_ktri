export default function PageHeader({ title, description, actions, back }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {back}
        <h1 className="text-2xl font-semibold text-base-content">{title}</h1>
        {description && <p className="mt-1 text-sm text-base-content/60">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
