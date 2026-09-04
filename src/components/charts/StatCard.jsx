import Icon from '../Icon'

const TONES = {
  primary: { badge: 'bg-primary/12 text-primary', blob: 'bg-primary' },
  success: { badge: 'bg-success/15 text-[oklch(50%_0.16_155)]', blob: 'bg-success' },
  warning: { badge: 'bg-warning/15 text-[oklch(60%_0.17_80)]', blob: 'bg-warning' },
  error: { badge: 'bg-error/12 text-error', blob: 'bg-error' },
  info: { badge: 'bg-info/15 text-info', blob: 'bg-info' },
  secondary: { badge: 'bg-secondary/15 text-secondary', blob: 'bg-secondary' },
}

const TREND_TEXT_CLASS = {
  up: 'text-success',
  down: 'text-error',
  flat: 'text-base-content/40',
}

const TREND_ARROW = { up: '↑', down: '↓', flat: '—' }

export default function StatCard({ icon, label, value, sublabel, trend, tone = 'primary', tag }) {
  const t = TONES[tone] ?? TONES.primary

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div
        className={`pointer-events-none absolute -right-6 -top-6 size-24 rounded-full opacity-[0.08] transition-transform duration-300 group-hover:scale-110 ${t.blob}`}
      />
      <div className="relative mb-3 flex items-start justify-between gap-2">
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${t.badge}`}>
          <Icon name={icon} className="size-5" />
        </span>
        {tag && (
          <span className="rounded-full bg-base-200 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-base-content/50">
            {tag}
          </span>
        )}
      </div>
      <p className="relative truncate text-sm font-medium text-base-content/60">{label}</p>
      <p className="relative mt-0.5 text-3xl font-black tracking-tight text-base-content">{value}</p>
      {trend && (
        <p className={`relative mt-2 truncate text-xs font-semibold ${TREND_TEXT_CLASS[trend.direction] ?? TREND_TEXT_CLASS.flat}`}>
          {TREND_ARROW[trend.direction] ?? TREND_ARROW.flat} {trend.text}
        </p>
      )}
      {!trend && sublabel && <p className="relative mt-2 text-xs text-base-content/50">{sublabel}</p>}
    </div>
  )
}
