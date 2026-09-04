import { useEffect, useState } from 'react'
import { ThemeContext } from './themeContext'

const STORAGE_KEY = 'davomat-theme'
const LIGHT = 'davomat'
const DARK = 'night'

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === LIGHT || stored === DARK) return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK : LIGHT
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === LIGHT ? DARK : LIGHT))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === DARK }}>
      {children}
    </ThemeContext.Provider>
  )
}
