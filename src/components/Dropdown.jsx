import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useClickOutside } from '../hooks/useClickOutside'
import Icon from './Icon'

const POPUP_MAX_HEIGHT = 240
const GAP = 6

export default function Dropdown({ id, value, onChange, options, placeholder = 'Tanlang', triggerClassName }) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState(null)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const popupRef = useRef(null)
  const outsideRefs = useMemo(() => [rootRef, popupRef], [])

  useClickOutside(outsideRefs, () => setOpen(false))

  // Modal yoki boshqa overflow:hidden/auto konteynerlar ichida joylashgan
  // dropdown popup'i ular tomonidan "kesib tashlanmasligi" uchun
  // document.body'ga portal orqali chiqariladi va ekran koordinatalari
  // bo'yicha (fixed) joylashtiriladi.
  useLayoutEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const spaceBelow = window.innerHeight - rect.bottom
      const openUp = spaceBelow < POPUP_MAX_HEIGHT && rect.top > spaceBelow
      setPosition({
        left: rect.left,
        width: rect.width,
        top: openUp ? null : rect.bottom + GAP,
        bottom: openUp ? window.innerHeight - rect.top + GAP : null,
      })
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)
    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [open])

  const selected = options.find((o) => String(o.value) === String(value))

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group ${triggerClassName}`}
      >
        <span className={`truncate ${selected ? '' : 'text-base-content/40'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon
          name="chevronDown"
          className={`size-4 shrink-0 transition-all duration-200 group-hover:text-primary ${open ? 'rotate-180 text-primary' : 'text-base-content/40'}`}
        />
      </button>

      {open &&
        position &&
        createPortal(
          <div
            ref={popupRef}
            role="listbox"
            style={{
              position: 'fixed',
              left: position.left,
              width: position.width,
              top: position.top ?? undefined,
              bottom: position.bottom ?? undefined,
              maxHeight: POPUP_MAX_HEIGHT,
            }}
            className="z-60 min-w-max overflow-y-auto rounded-xl border border-base-300 bg-base-100 p-1.5 shadow-lg"
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(String(opt.value))
                    setOpen(false)
                  }}
                  className={[
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    isSelected
                      ? 'bg-primary/10 font-medium text-primary'
                      : 'text-base-content hover:bg-base-200',
                  ].join(' ')}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Icon name="check" className="size-3.5 shrink-0" />}
                </button>
              )
            })}
          </div>,
          document.body,
        )}
    </div>
  )
}
