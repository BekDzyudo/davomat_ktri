import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { navItems } from '../config/navigation'
import { getDashboardPath } from '../config/dashboard'
import { useAuth } from '../context/useAuth'
import Icon from './Icon'
import Logo from './Logo'

export default function Sidebar() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const visibleItems = navItems.filter((item) => item.roles.includes(currentUser?.role))
  const resolvePath = (item) =>
    item.key === 'dashboard' ? getDashboardPath(currentUser?.role) : item.path

  return (
    <div className="drawer-side z-20">
      <label htmlFor="app-drawer" aria-label="Menyuni yopish" className="drawer-overlay" />
      <aside className="flex min-h-full w-64 flex-col gap-1 border-r border-base-300 bg-base-100 p-4">
        <Link
          to="/"
          className="group mb-6 flex items-center gap-2 rounded-box px-2 py-1 transition-colors duration-200 hover:bg-base-200"
        >
          <Logo className="h-10 w-10 shrink-0 transition-transform duration-200 group-hover:scale-105" />
          <span className="text-sm font-semibold tracking-tight text-base-content">
            {t('app.name')}
          </span>
        </Link>

        <ul className="flex w-full flex-col gap-1">
          {visibleItems.map((item) => (
            <li key={item.key}>
              <NavLink
                to={resolvePath(item)}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-box border px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'border-primary/20 bg-primary text-primary-content shadow-sm'
                      : 'border-transparent text-base-content/70 hover:border-base-300 hover:bg-base-200 hover:text-base-content',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      name={item.icon}
                      className={[
                        'size-5 shrink-0 transition-all duration-200 ease-out group-hover:scale-110 group-hover:-translate-y-0.5',
                        isActive ? '' : 'group-hover:text-primary',
                      ].join(' ')}
                    />
                    <span>{t(`nav.${item.key}`)}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="relative mt-auto overflow-hidden rounded-2xl bg-linear-to-br from-[oklch(52%_0.20_290)] via-[oklch(52%_0.16_260)] to-[oklch(62%_0.14_190)] p-4 text-white">
          <div className="pointer-events-none absolute -bottom-6 -right-4 size-20 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -right-10 size-24 rounded-full bg-white/10" />
          <span className="relative flex size-9 items-center justify-center rounded-xl bg-white/20">
            <Icon name="chart" className="size-4.5" />
          </span>
          <p className="relative mt-3 text-sm font-bold leading-tight">Ma'lumotlar doim siz bilan!</p>
          <p className="relative mt-1 text-xs text-white/75">
            Davomat statistikasi real vaqt rejimida yangilanadi.
          </p>
        </div>
      </aside>
    </div>
  )
}
