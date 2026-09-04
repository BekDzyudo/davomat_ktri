export const ATTENDANCE_STATUSES = [
  {
    key: 'keldi',
    label: 'Keldi',
    icon: 'check',
    active: 'border-success bg-success text-success-content shadow-sm',
    idle: 'border-base-300 text-base-content/60 hover:border-success/40 hover:bg-success/10 hover:text-success',
    chartColor: 'var(--color-success)',
  },
  {
    key: 'kelmadi',
    label: 'Kelmadi',
    icon: 'x',
    active: 'border-error bg-error text-error-content shadow-sm',
    idle: 'border-base-300 text-base-content/60 hover:border-error/40 hover:bg-error/10 hover:text-error',
    chartColor: 'var(--color-error)',
  },
  {
    key: 'kech_qoldi',
    label: "Kech qoldi",
    icon: 'clock',
    active: 'border-warning bg-warning text-warning-content shadow-sm',
    idle: 'border-base-300 text-base-content/60 hover:border-warning/40 hover:bg-warning/10 hover:text-warning',
    chartColor: 'var(--color-warning)',
  },
  {
    key: 'sababli',
    label: 'Sababli',
    icon: 'fileText',
    active: 'border-info bg-info text-info-content shadow-sm',
    idle: 'border-base-300 text-base-content/60 hover:border-info/40 hover:bg-info/10 hover:text-info',
    chartColor: 'var(--color-info)',
  },
]

export const STATUS_LABELS = {
  ...Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s.key, s.label])),
  belgilanmagan: 'belgilanmagan',
}
