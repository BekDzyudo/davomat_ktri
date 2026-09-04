// Backend RoleEnum (superadmin, admin, dean, teacher, student) frontend
// ROLES konstantalariga (superadmin, admin, dekan, oqituvchi, talaba) mos keladi.
const ROLE_FROM_API = {
  superadmin: 'superadmin',
  admin: 'admin',
  dean: 'dekan',
  teacher: 'oqituvchi',
  student: 'talaba',
}

const ROLE_TO_API = {
  superadmin: 'superadmin',
  admin: 'admin',
  dekan: 'dean',
  oqituvchi: 'teacher',
  talaba: 'student',
}

export function mapRoleFromApi(role) {
  return ROLE_FROM_API[role] ?? role
}

export function mapRoleToApi(role) {
  return ROLE_TO_API[role] ?? role
}
