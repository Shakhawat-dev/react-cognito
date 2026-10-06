import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth.ts'

export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="status">Loading…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

// Keeps signed-in users away from the login / signup pages.
export function PublicOnlyRoute() {
  const { user, loading } = useAuth()

  if (loading) return <p className="status">Loading…</p>
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
