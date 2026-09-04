import { useEffect } from 'react'

// `refs` bitta ref yoki reflar massivi bo'lishi mumkin (masalan trigger +
// portal orqali document.body'ga chiqarilgan popup — ikkalasi ham "ichkari"
// hisoblanishi kerak).
export function useClickOutside(refs, handler) {
  useEffect(() => {
    const list = Array.isArray(refs) ? refs : [refs]
    function handleClick(event) {
      const isInside = list.some((ref) => ref.current && ref.current.contains(event.target))
      if (!isInside) handler()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [refs, handler])
}
