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
    <header className="navbar sticky top-0 z-10 gap-2 border-b border-base-300 bg-base-100 px-4">
      <div className="flex-none lg:hidden">
        <label
          htmlFor="app-drawer"
          className="group flex size-10 cursor-pointer items-center justify-center rounded-box text-base-content/60 transition-colors duration-200 hover:bg-base-200 hover:text-primary"
          aria-label="Menyu"
        >
          <Icon name="menu" className="size-5 transition-transform duration-200 group-hover:scale-110" />
        </label>
      </div>

      <div className="flex-1" />

      <Link
        to="/notifications"
        className="group flex size-10 items-center justify-center rounded-box border border-base-300 bg-base-100 text-base-content/60 shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-base-200 hover:text-primary"
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
        className="group flex size-10 items-center justify-center rounded-box border border-base-300 bg-base-100 text-base-content shadow-sm transition-colors duration-200 hover:border-primary/40 hover:bg-base-200 hover:text-primary"
        aria-label={t('header.toggleTheme')}
      >
        <Icon
          name={isDark ? 'sun' : 'moon'}
          className="size-5 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110"
        />
      </button>

      <Link
        to="/profile"
        className="group flex items-center gap-2 rounded-box pl-2 transition-colors duration-200 hover:bg-base-200"
      >
        <div className="flex flex-col items-end leading-tight">
          <span className="text-sm font-medium text-base-content">{currentUser?.fullName}</span>
          <span className="text-xs text-base-content/60">{ROLE_LABELS[currentUser?.role]}</span>
        </div>
        <div className="avatar avatar-placeholder">
          <div className="w-9 overflow-hidden rounded-full bg-primary text-primary-content transition-transform duration-200 group-hover:scale-105">
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
        className="group flex size-10 items-center justify-center rounded-box text-base-content/60 transition-colors duration-200 hover:bg-error/10 hover:text-error"
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
