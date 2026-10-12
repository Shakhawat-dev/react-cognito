import { useEffect, useState, type ReactNode } from 'react'
import { Hub } from 'aws-amplify/utils'
import { fetchAuthSession, getCurrentUser, signOut, type AuthSession, type AuthUser } from 'aws-amplify/auth'
import { AuthContext } from './useAuth.ts'

function groupsFrom({ tokens }: AuthSession): string[] {
  const groups = tokens?.accessToken.payload['cognito:groups']
  return Array.isArray(groups) ? groups.map(String) : []
}

type AuthState = { user: AuthUser | null; groups: string[] }

async function loadAuthState(forceRefresh = false): Promise<AuthState> {
  try {
    const [user, session] = await Promise.all([getCurrentUser(), fetchAuthSession({ forceRefresh })])
    return { user, groups: groupsFrom(session) }
  } catch {
    return { user: null, groups: [] }
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [groups, setGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  function apply(state: AuthState) {
    setUser(state.user)
    setGroups(state.groups)
    setLoading(false)
  }

  async function refresh({ forceRefresh = false } = {}) {
    apply(await loadAuthState(forceRefresh))
  }

  async function logout() {
    await signOut()
    setUser(null)
    setGroups([])
  }

  useEffect(() => {
    loadAuthState().then(apply)
    return Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
        case 'tokenRefresh':
          refresh()
          break
        case 'signedOut':
        case 'tokenRefresh_failure':
          setUser(null)
          setGroups([])
          break
      }
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, groups, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
