import { useCallback, useState } from 'react'

// Tanlangan guruhni brauzer localStorage'ida saqlaydi — sahifa yangilansa
// (refresh) ham oldingi tanlov saqlanib qoladi. `key` har bir sahifa uchun
// alohida bo'lishi kerak (masalan 'schedule', 'reports').
export function usePersistedGroupId(key) {
  const storageKey = `davomat_ktri.selectedGroupId.${key}`

  const [groupId, setGroupIdState] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? Number(stored) : null
    } catch {
      return null
    }
  })

  const setGroupId = useCallback(
    (nextId) => {
      setGroupIdState(nextId)
      try {
        if (nextId === null || nextId === undefined) {
          localStorage.removeItem(storageKey)
        } else {
          localStorage.setItem(storageKey, String(nextId))
        }
      } catch {
        // localStorage mavjud bo'lmasa (masalan xususiy rejim) jim o'tkazib yuboramiz
      }
    },
    [storageKey],
  )

  // Yuklangan guruhlar ro'yxatiga qarab tekshiradi: saqlangan ID hali ham
  // mavjudmi (guruh o'chirilmaganmi) — bo'lmasa birinchi guruhga tushadi.
  const resolveGroupId = useCallback((groups) => {
    setGroupIdState((prev) => {
      if (prev && groups.some((g) => g.id === prev)) return prev
      return groups[0]?.id ?? null
    })
  }, [])

  return [groupId, setGroupId, resolveGroupId]
}
