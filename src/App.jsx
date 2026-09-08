import { Route, Routes } from 'react-router-dom'
import { ROLES } from './data/roles'
import MainLayout from './layouts/MainLayout'
import Attendance from './pages/Attendance'
import Faculties from './pages/Faculties'
import ForgotPassword from './pages/ForgotPassword'
import GroupDetail from './pages/GroupDetail'
import Groups from './pages/Groups'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import PublicHome from './pages/PublicHome'
import Reports from './pages/Reports'
import Schedule from './pages/Schedule'
import Staff from './pages/Staff'
import Subjects from './pages/Subjects'
import Users from './pages/Users'
import DashboardRoute from './routes/DashboardRoute'
import RequireRole from './routes/RequireRole'

const ADMIN_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN]
const SCHEDULE_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.DEKAN, ROLES.OQITUVCHI]
const REPORTS_ROLES = [ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.DEKAN]

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicHome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<MainLayout />}>
        <Route path="/dashboard/:section" element={<DashboardRoute />} />
        <Route
          path="/users"
          element={
            <RequireRole roles={ADMIN_ROLES}>
              <Users />
            </RequireRole>
          }
        />
        <Route
          path="/staff"
          element={
            <RequireRole roles={[ROLES.SUPERADMIN]}>
              <Staff />
            </RequireRole>
          }
        />
        <Route
          path="/faculties"
          element={
            <RequireRole roles={ADMIN_ROLES}>
              <Faculties />
            </RequireRole>
          }
        />
        <Route
          path="/groups"
          element={
            <RequireRole roles={ADMIN_ROLES}>
              <Groups />
            </RequireRole>
          }
        />
        <Route
          path="/groups/:id"
          element={
            <RequireRole roles={ADMIN_ROLES}>
              <GroupDetail />
            </RequireRole>
          }
        />
        <Route
          path="/subjects"
          element={
            <RequireRole roles={ADMIN_ROLES}>
              <Subjects />
            </RequireRole>
          }
        />
        <Route
          path="/schedule"
          element={
            <RequireRole roles={SCHEDULE_ROLES}>
              <Schedule />
            </RequireRole>
          }
        />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route
          path="/reports"
          element={
            <RequireRole roles={REPORTS_ROLES}>
              <Reports />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
