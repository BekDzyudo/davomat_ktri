import Icon from '../Icon'

const COLORS = {
  view: 'text-secondary/70 hover:bg-secondary/10 hover:text-secondary',
  edit: 'text-info/70 hover:bg-info/10 hover:text-info',
  danger: 'text-error/70 hover:bg-error/10 hover:text-error',
  assign: 'text-accent/70 hover:bg-accent/10 hover:text-accent',
}

const MOTION = {
  view: 'group-hover:scale-110',
  edit: 'group-hover:scale-110 group-hover:-rotate-12',
  danger: 'group-hover:scale-110 group-hover:rotate-6 group-active:scale-90 group-active:rotate-0',
  assign: 'group-hover:scale-110 group-hover:rotate-12',
}

export default function RowActionButton({ icon, label, onClick, variant = 'view' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`group flex size-8 items-center justify-center rounded-box transition-colors duration-200 ${COLORS[variant] ?? COLORS.view}`}
    >
      <Icon
        name={icon}
        className={`size-4 transition-transform duration-200 ease-out ${MOTION[variant] ?? MOTION.view}`}
      />
    </button>
  )
}
