import { useEffect, useState, type ReactNode } from 'react'
import { Hub } from 'aws-amplify/utils'
import { getCurrentUser, signOut, type AuthUser } from 'aws-amplify/auth'
import { AuthContext } from './useAuth.ts'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      setUser(await getCurrentUser())
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function logout() {
    await signOut()
    setUser(null)
  }

  useEffect(() => {
    refresh()
    return Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          refresh()
          break
        case 'signedOut':
        case 'tokenRefresh_failure':
          setUser(null)
          break
      }
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

