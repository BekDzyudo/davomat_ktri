import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useClickOutside } from '../hooks/useClickOutside'
import Icon from './Icon'

const POPUP_MAX_HEIGHT = 240

const GAP = 6

export default function Dropdown({
  id,
  value,
  onChange,
  options,
  placeholder = 'Tanlang',
  triggerClassName,
  searchable = false,
  searchPlaceholder = 'Qidirish...',
  createLabel,
  onCreateNew,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [position, setPosition] = useState(null)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const popupRef = useRef(null)
  const searchInputRef = useRef(null)
  const outsideRefs = useMemo(() => [rootRef, popupRef], [])

  // Yopilganda qidiruv matni ham tozalanadi — keyingi ochilishda ro'yxat to'liq ko'rinadi.
  const close = () => {
    setOpen(false)
    setQuery('')
  }

  useClickOutside(outsideRefs, close)

  useEffect(() => {
    if (open && searchable) searchInputRef.current?.focus()
  }, [open, searchable])

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

  const filteredOptions = useMemo(() => {
    if (!searchable || !query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter((o) => o.label?.toLowerCase().includes(q))
  }, [options, query, searchable])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Escape' && close()}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`group ${triggerClassName}`}
      >
        <span className={`truncate ${selected ? '' : 'text-base-content/40'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <Icon
          name="chevronDown"
          className={`size-4 shrink-0 transition-all duration-200 group-hover:text-primary ${open ? 'rotate-180 text-primary' : 'text-base-content/60'}`}
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
            className="z-60 flex min-w-max flex-col overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-lg"
          >
            {searchable && (
              <div className="shrink-0 border-b border-base-300 p-1.5">
                <div className="relative">
                  <Icon
                    name="search"
                    className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-base-content/40"
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && close()}
                    placeholder={searchPlaceholder}
                    className="w-full rounded-lg border-0 bg-base-200/50 py-1.5 pl-8 pr-2.5 text-sm text-base-content outline-none placeholder:text-base-content/40 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            )}

            <div className="overflow-y-auto p-1.5">
              {onCreateNew && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      close()
                      onCreateNew()
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                  >
                    <Icon name="plus" className="size-3.5 shrink-0" />
                    <span className="truncate">{createLabel ?? 'Yangi qo\'shish'}</span>
                  </button>
                  <div className="my-1 border-t border-base-300" />
                </>
              )}

              {filteredOptions.length === 0 && (
                <p className="px-3 py-2 text-sm text-base-content/40">Hech narsa topilmadi</p>
              )}

              {filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value)
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(String(opt.value))
                      close()
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
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
