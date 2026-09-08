import { useState } from 'react'
import Icon from '../../components/Icon'
import AttendanceCalendarModal from '../../components/AttendanceCalendarModal'

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
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setModalOpen(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setModalOpen(true)
        }
      }}
      className={[
        'flex min-w-0 cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm',
        present ? 'border-success/20 bg-success/10' : 'border-error/20 bg-error/10',
      ].join(' ')}
    >
      <span className="relative shrink-0">
        <span
          className="flex size-8 items-center justify-center overflow-hidden rounded-full text-[12px] font-bold"
        >
          {member.avatar ? (
            <img src={member.avatar} alt="" className="size-full object-cover" />
          ) : (
            <span className={`flex size-full items-center justify-center ${paletteFor(member.name)}`}>
              {initials(member.name)}
            </span>
          )}
        </span>
        {present && (
          <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-base-100 bg-success" />
        )}
      </span>

      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[14px] font-semibold text-base-content" title={member.name}>{member.name}</p>
        <p className="truncate text-[12px] text-base-content/60" title={member.position}>{member.position}</p>
      </div>

      {present && (
        <span
          className={[
            'flex shrink-0 items-center gap-0.5 rounded-md px-1.5 py-1 text-[12px] font-bold text-white',
            late ? 'bg-warning' : 'bg-success',
          ].join(' ')}
        >
          <Icon name="clock" className="size-3" />
          {member.checkIn}
        </span>
      )}

      <button
        type="button"
        aria-label="Tahrirlash"
        onClick={(e) => {
          e.stopPropagation()
          setModalOpen(true)
        }}
        className="flex size-6 shrink-0 items-center justify-center rounded-md text-base-content/40 transition-colors hover:bg-base-content/10 hover:text-base-content"
      >
        <Icon name="pencil" className="size-3" />
      </button>

      {modalOpen && (
        <AttendanceCalendarModal member={member} staffId={member.staffId} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
