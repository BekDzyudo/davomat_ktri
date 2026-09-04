export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  DEKAN: 'dekan',
  OQITUVCHI: 'oqituvchi',
  TALABA: 'talaba',
}

export const ROLE_LABELS = {
  [ROLES.SUPERADMIN]: 'SuperAdmin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.DEKAN]: 'Dekan',
  [ROLES.OQITUVCHI]: "O'qituvchi",
  [ROLES.TALABA]: 'Talaba',
}

export const ROLE_ICONS = {
  [ROLES.SUPERADMIN]: 'lock',
  [ROLES.ADMIN]: 'badgeCheck',
  [ROLES.DEKAN]: 'building',
  [ROLES.OQITUVCHI]: 'book',
  [ROLES.TALABA]: 'users',
}

export const ROLE_TONES = {
  [ROLES.SUPERADMIN]: 'primary',
  [ROLES.ADMIN]: 'info',
  [ROLES.DEKAN]: 'secondary',
  [ROLES.OQITUVCHI]: 'warning',
  [ROLES.TALABA]: 'success',
}
