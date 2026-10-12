import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.ts'
import Forbidden from '../pages/Forbidden.tsx'

// With `group`, the user must also be in that Cognito group. This only hides UI:
// anything that must stay private has to be checked again by the backend from the token.
export function ProtectedRoute({ group }: { group?: string }) {
  const { user, groups, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="status">Loading…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (group && !groups.includes(group)) return <Forbidden group={group} />
  return <Outlet />
}

// Keeps signed-in users away from the login / signup pages.
export function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) return <p className="status">Loading…</p>
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
