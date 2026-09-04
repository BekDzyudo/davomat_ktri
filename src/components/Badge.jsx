const STYLES = {
  faol: 'bg-success/10 text-success',
  nofaol: 'bg-base-300 text-base-content/60',
}

export default function Badge({ status, children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STYLES[status] ?? STYLES.nofaol}`}
    >
      {children}
    </span>
  )
}
