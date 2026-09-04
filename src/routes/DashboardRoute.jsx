import { Navigate, useParams } from 'react-router-dom'
import { getDashboardPath } from '../config/dashboard'
import { useAuth } from '../context/useAuth'
import Dashboard from '../pages/Dashboard'

export default function DashboardRoute() {
  const { section } = useParams()
  const { currentUser } = useAuth()
  const expectedPath = getDashboardPath(currentUser.role)

  if (expectedPath !== `/dashboard/${section}`) {
    return <Navigate to={expectedPath} replace />
  }

  return <Dashboard />
}
