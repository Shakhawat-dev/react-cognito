import { createContext, useContext } from 'react'
import type { AuthUser } from 'aws-amplify/auth'

// Cognito group whose members can open /admin.
export const ADMIN_GROUP = 'admin'

export type AuthContextValue = {
  user: AuthUser | null
  // From the access token's `cognito:groups` claim; empty when the user is in no group.
  groups: string[]
  loading: boolean
  // forceRefresh fetches new tokens, e.g. to pick up a group the user was just added to.
  refresh: (options?: { forceRefresh?: boolean }) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
