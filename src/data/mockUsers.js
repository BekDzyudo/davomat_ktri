import { ROLES } from './roles'

// Backend tayyor bo'lguncha ishlatiladigan mock foydalanuvchilar va
// login sahifasidagi mock autentifikatsiya uchun asos.
export const mockUsers = [
  { id: 1, fullName: 'Shohbek Jalilov', username: 'superadmin', password: 'parol123', role: ROLES.SUPERADMIN },
  { id: 2, fullName: 'Aziz Karimov', username: 'admin', password: 'parol123', role: ROLES.ADMIN },
  {
    id: 3,
    fullName: 'Malika Yusupova',
    username: 'dekan',
    password: 'parol123',
    role: ROLES.DEKAN,
    faculty: 'Axborot texnologiyalari',
  },
  { id: 4, fullName: 'Bobur Rashidov', username: 'oqituvchi', password: 'parol123', role: ROLES.OQITUVCHI },
  { id: 5, fullName: 'Nodira Ergasheva', username: 'talaba', password: 'parol123', role: ROLES.TALABA },
]
