import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getDashboard } from '../api/reports'
import Alert from '../components/form/Alert'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../context/useAuth'
import { ROLES } from '../data/roles'
import AdminDashboard from '../features/dashboard/AdminDashboard'
import DekanDashboard from '../features/dashboard/DekanDashboard'
import StudentDashboard from '../features/dashboard/StudentDashboard'
import TeacherDashboard from '../features/dashboard/TeacherDashboard'

const ADMIN_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN]

export default function Dashboard() {
  const { t } = useTranslation()
  const { currentUser } = useAuth()
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false
    getDashboard()
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Ma'lumotlarni yuklab bo'lmadi")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loadError) {
    return (
      <div>
        <PageHeader title={t('pages.dashboard.title')} />
        <Alert variant="error">{loadError}</Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (ADMIN_ROLES.includes(currentUser.role)) {
    return (
      <div>
        <PageHeader title={t('pages.dashboard.title')} />
        <AdminDashboard data={data} />
      </div>
    )
  }

  if (currentUser.role === ROLES.OQITUVCHI) {
    return (
      <div>
        <PageHeader title={t('pages.dashboard.title')} />
        <TeacherDashboard data={data} />
      </div>
    )
  }

  if (currentUser.role === ROLES.DEKAN) {
    return (
      <div>
        <PageHeader title={t('pages.dashboard.title')} />
        <DekanDashboard data={data} />
      </div>
    )
  }

  if (currentUser.role === ROLES.TALABA) {
    return (
      <div>
        <PageHeader title={t('pages.dashboard.title')} />
        <StudentDashboard data={data} />
      </div>
    )
  }

  return <PageHeader title={t('pages.dashboard.title')} />
}
