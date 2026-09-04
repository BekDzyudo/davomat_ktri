import Icon from '../Icon'

export default function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-base-content/70">
      <Icon name="search" className="size-8" />
      <p className="text-sm">{message}</p>
    </div>
  )
}
