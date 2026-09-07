import Icon from '../../components/Icon'

const AVATAR_PALETTE = [
  'bg-primary/15 text-primary',
  'bg-secondary/15 text-secondary',
  'bg-accent/15 text-accent',
  'bg-info/15 text-info',
]

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function paletteFor(name) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % AVATAR_PALETTE.length
  return AVATAR_PALETTE[hash]
}

// Xodim ish vaqti holati faqat kelish vaqti (checkIn) borligiga qarab
// belgilanadi: umuman kelmagan/hali belgilanmagan bo'lsa qizg'ish fon,
// kelgan bo'lsa (vaqtidan qat'i nazar) yashil fon — kech qolgan/qolmaganligi
// esa faqat vaqt yorlig'ining rangida (yashil/sariq) ko'rsatiladi.
export default function StaffMemberRow({ member }) {
  const present = !!member.checkIn
  const late = present && member.checkIn > '09:00'

  return (
    <div
      className={[
        'flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
        present ? 'border-success/20 bg-success/10' : 'border-error/20 bg-error/10',
      ].join(' ')}
    >
      <span className="relative shrink-0">
        <span
          className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${paletteFor(member.name)}`}
        >
          {initials(member.name)}
        </span>
        {present && (
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-base-100 bg-success" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="wrap-break-word text-sm font-semibold leading-tight text-base-content">{member.name}</p>
        <p className="wrap-break-word text-xs leading-tight text-base-content/60">{member.position}</p>
      </div>

      {present && (
        <span
          className={[
            'flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs font-bold',
            late ? 'bg-warning text-warning-content' : 'bg-success text-success-content',
          ].join(' ')}
        >
          <Icon name="clock" className="size-3" />
          {member.checkIn}
        </span>
      )}

      <button
        type="button"
        aria-label="Tahrirlash"
        className="flex size-7 shrink-0 items-center justify-center rounded-full text-base-content/40 transition-colors hover:bg-base-content/10 hover:text-base-content"
      >
        <Icon name="pencil" className="size-3.5" />
      </button>
    </div>
  )
}
