import { useCallback, useMemo, useRef, useState } from 'react'
import CenterToast from '../components/CenterToast'
import { ToastContext } from './toastContext'

const AUTO_CLOSE_MS = 5000

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const dismiss = useCallback(() => {
    clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  const show = useCallback(
    (variant, message, details) => {
      clearTimeout(timerRef.current)
      setToast({ variant, message, details })
      timerRef.current = setTimeout(dismiss, AUTO_CLOSE_MS)
    },
    [dismiss],
  )

  const value = useMemo(
    () => ({
      success: (message, details) => show('success', message, details),
      error: (message, details) => show('error', message, details),
      warning: (message, details) => show('warning', message, details),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <CenterToast
        open={!!toast}
        variant={toast?.variant}
        message={toast?.message}
        details={toast?.details}
        onClose={dismiss}
      />
    </ToastContext.Provider>
  )
}
