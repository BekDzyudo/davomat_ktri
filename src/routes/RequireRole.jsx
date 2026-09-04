import { Navigate } from 'react-router-dom'
import { getDashboardPath } from '../config/dashboard'
import { useAuth } from '../context/useAuth'

export default function RequireRole({ roles, children }) {
  const { currentUser } = useAuth()

  if (!roles.includes(currentUser.role)) {
    return <Navigate to={getDashboardPath(currentUser.role)} replace />
  }

  return children
}
