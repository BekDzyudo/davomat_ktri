import { useTranslation } from 'react-i18next'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../data/roles'
import AdminAttendance from '../features/attendance/AdminAttendance'
import StudentAttendance from '../features/attendance/StudentAttendance'
import TeacherAttendance from '../features/attendance/TeacherAttendance'

const ADMIN_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN]

export default function Attendance() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()

  if (ADMIN_ROLES.includes(currentUser.role)) {
    return (
      <div>
        <PageHeader
          title={t('pages.attendance.title')}
          description="Barcha guruhlar davomati — ko'rish va tahrirlash"
        />
        <AdminAttendance />
      </div>
    )
  }

  if (currentUser.role === ROLES.OQITUVCHI) {
    return (
      <div>
        <PageHeader title={t('pages.attendance.title')} description="O'zingizga biriktirilgan darslar bo'yicha davomat" />
        <TeacherAttendance />
      </div>
    )
  }

  if (currentUser.role === ROLES.TALABA) {
    return (
      <div>
        <PageHeader title={t('pages.attendance.title')} description="Sizning davomat tarixingiz" />
        <StudentAttendance />
      </div>
    )
  }

  return <PageHeader title={t('pages.attendance.title')} />
}
