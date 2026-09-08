import { ROLES } from '../data/roles'

const { SUPERADMIN, ADMIN, DEKAN, OQITUVCHI, TALABA } = ROLES

export const navItems = [
  { key: 'dashboard', path: '/dashboard', icon: 'home', roles: [SUPERADMIN, ADMIN, DEKAN, OQITUVCHI, TALABA] },
  { key: 'users', path: '/users', icon: 'users', roles: [SUPERADMIN, ADMIN] },
  { key: 'staff', path: '/staff', icon: 'sitemap', roles: [SUPERADMIN] },
  { key: 'faculties', path: '/faculties', icon: 'building', roles: [SUPERADMIN, ADMIN] },
  { key: 'groups', path: '/groups', icon: 'group', roles: [SUPERADMIN, ADMIN] },
  { key: 'subjects', path: '/subjects', icon: 'book', roles: [SUPERADMIN, ADMIN] },
  { key: 'schedule', path: '/schedule', icon: 'calendar', roles: [SUPERADMIN, ADMIN, DEKAN, OQITUVCHI] },
  { key: 'attendance', path: '/attendance', icon: 'check', roles: [SUPERADMIN, ADMIN, DEKAN, OQITUVCHI, TALABA] },
  { key: 'reports', path: '/reports', icon: 'chart', roles: [SUPERADMIN, ADMIN, DEKAN] },
]
