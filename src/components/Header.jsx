import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { ROLE_LABELS } from '../data/roles'
import { useAuth } from '../context/useAuth'
import { useTheme } from '../context/useTheme'
import Icon from './Icon'

export default function Header() {
  const { t } = useTranslation()
  const { currentUser, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar sticky top-0 z-10 gap-2 overflow-hidden bg-fixed px-4 bg-[url(/bino.png)] bg-cover bg-position-[center_100%]">
      <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[oklch(45%_0.18_231)]/85 via-[oklch(48%_0.14_210)]/45 to-[oklch(52%_0.14_190)]/85" />

      <div className="relative flex-none lg:hidden">
        <label
          htmlFor="app-drawer"
          className="group flex size-10 cursor-pointer items-center justify-center rounded-box text-white/80 transition-colors duration-200 hover:bg-white/15 hover:text-white"
          aria-label="Menyu"
        >
          <Icon name="menu" className="size-5 transition-transform duration-200 group-hover:scale-110" />
        </label>
      </div>

      <div className="relative flex-1" />

      <Link
        to="/notifications"
        className="group relative flex size-10 items-center justify-center rounded-box bg-white/10 text-white/90 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 hover:text-white"
        aria-label="Bildirishnomalar"
      >
        <Icon
          name="bell"
          className="size-5 transition-transform duration-200 group-hover:-rotate-12 group-hover:scale-110"
        />
      </Link>

      <button
        type="button"
        onClick={toggleTheme}
        className="group relative flex size-10 items-center justify-center rounded-box bg-white/10 text-white/90 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 hover:text-white"
        aria-label={t('header.toggleTheme')}
      >
        <Icon
          name={isDark ? 'sun' : 'moon'}
          className="size-5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110"
        />
      </button>

      <Link
        to="/profile"
        className="group relative flex items-center gap-2 rounded-box pl-2 transition-colors duration-200 hover:bg-white/10"
      >
        <div className="flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-white">{currentUser?.fullName}</span>
          <span className="text-xs text-white/70">{ROLE_LABELS[currentUser?.role]}</span>
        </div>
        <div className="avatar avatar-placeholder">
          <div className="w-9 overflow-hidden rounded-full bg-white/20 text-white ring-2 ring-white/40 transition-transform duration-200 group-hover:scale-105">
            {currentUser?.photo ? (
              <img src={currentUser.photo} alt={currentUser.fullName} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm">{currentUser?.fullName?.[0] ?? '?'}</span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        className="group relative flex size-10 items-center justify-center rounded-box text-white/80 transition-colors duration-200 hover:bg-error/20 hover:text-white"
        aria-label={t('header.logout')}
      >
        <Icon
          name="logout"
          className="size-5 transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </button>
    </header>
  )
}
