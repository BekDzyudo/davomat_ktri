import { ROLES } from '../data/roles'

// Login qilingandan so'ng har bir rol o'zining bosh sahifasiga yo'naltiriladi.
export const ROLE_DASHBOARD_SECTION = {
  [ROLES.SUPERADMIN]: 'admin',
  [ROLES.ADMIN]: 'admin',
  [ROLES.DEKAN]: 'dean',
  [ROLES.OQITUVCHI]: 'teacher',
  [ROLES.TALABA]: 'student',
}

export function getDashboardPath(role) {
  return `/dashboard/${ROLE_DASHBOARD_SECTION[role] ?? 'admin'}`
}
