import { useState } from 'react'
import Icon from '../../components/Icon'
import StaffMemberRow from './StaffMemberRow'

const NODE_STYLES = {
  director: { border: 'border-primary', icon: 'bg-primary text-primary-content', label: 'Direktor' },
  deputy: { border: 'border-secondary', icon: 'bg-secondary text-secondary-content', label: "O'rinbosar" },
  management: { border: 'border-accent', icon: 'bg-accent text-accent-content', label: 'Boshqarma' },
  department: { border: 'border-info', icon: 'bg-info text-info-content', label: "Bo'lim" },
  side: { border: 'border-warning', icon: 'bg-warning text-warning-content', label: "Bo'lim" },
}

export default function UnitBox({
  node,
  depth,
  hasToggle = false,
  isOpen = false,
  onToggle,
  toggleLabel,
  collapsibleMembers = false,
  fillWidth = false,
}) {
  const [membersOpen, setMembersOpen] = useState(false)
  const total = node.members.length
  const present = node.members.filter((m) => !!m.checkIn).length
  const type = depth === 0 ? 'director' : node.layout === 'side' ? 'side' : depth === 1 ? 'deputy' : node.children?.length ? 'management' : 'department'
  const style = NODE_STYLES[type]

  return (
    <div
      className={`${fillWidth ? 'w-full' : 'w-full'} min-w-0 rounded-2xl border-2 bg-base-100 shadow-sm ${style.border} ${isOpen ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100' : ''}`}
    >
      <div className="flex items-center gap-2.5 border-b border-base-200 px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[13px] font-bold leading-tight text-base-content">
            {node.title}
          </h3>
        </div>
        <span className="shrink-0 rounded-md bg-base-200 px-1.5 py-1 text-[12px] font-black tabular-nums text-base-content/60">
          {present}/{total}
        </span>
      </div>

      {(!collapsibleMembers || membersOpen) && (
        <div className="flex flex-col gap-1.5 p-1.5">
          {node.members.map((member) => (
            <StaffMemberRow key={member.id} member={member} />
          ))}
        </div>
      )}

      {collapsibleMembers && (
        <div className="flex justify-center px-2.5 pb-3">
          <button
            type="button"
            onClick={() => setMembersOpen((open) => !open)}
            aria-expanded={membersOpen}
            className="flex items-center gap-1.5 rounded-xl border border-base-300 bg-base-200/60 px-3 py-1.5 text-xs font-bold text-base-content/70 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Icon name="chevronDown" className={`size-3.5 transition-transform duration-200 ${membersOpen ? 'rotate-180' : ''}`} />
            {membersOpen ? 'Xodimlarni yashirish' : `Xodimlarni ko'rsatish (${total})`}
          </button>
        </div>
      )}

      {hasToggle && (
        <div className="flex justify-center pb-3">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={isOpen}
            aria-controls={`staff-children-${node.id}`}
            className="flex items-center gap-1.5 rounded-xl border border-base-300 bg-base-200/60 px-3 py-1.5 text-xs font-bold text-base-content/70 shadow-sm transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <Icon
              name="chevronDown"
              className={`size-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
            {toggleLabel}
          </button>
        </div>
      )}
    </div>
  )
}
