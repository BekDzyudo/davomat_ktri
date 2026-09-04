import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchMe, logout as apiLogout } from '../api/auth'
import { getAccessToken } from '../api/client'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(() => Boolean(getAccessToken()))

  useEffect(() => {
    let cancelled = false

    if (getAccessToken()) {
      fetchMe()
        .then((user) => {
          if (!cancelled) setCurrentUser(user)
        })
        .catch(() => {
          if (!cancelled) {
            apiLogout()
            setCurrentUser(null)
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false)
        })
    }

    const handleExpired = () => {
      setCurrentUser(null)
    }
    window.addEventListener('davomat:session-expired', handleExpired)

    return () => {
      cancelled = true
      window.removeEventListener('davomat:session-expired', handleExpired)
    }
  }, [])

  const logout = useCallback(() => {
    apiLogout()
    setCurrentUser(null)
  }, [])

  const value = useMemo(
    () => ({ currentUser, setCurrentUser, isLoading, logout }),
    [currentUser, isLoading, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
