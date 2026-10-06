import { useEffect, useState } from 'react'
import { fetchAuthSession, fetchUserAttributes } from 'aws-amplify/auth'
import { useAuth } from '../auth/useAuth.ts'

export default function Home() {
  const { user, logout } = useAuth()
  const [email, setEmail] = useState('')
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)

  useEffect(() => {
    fetchUserAttributes().then((attrs) => setEmail(attrs.email ?? ''))
    fetchAuthSession().then(({ tokens }) => {
      const exp = tokens?.idToken?.payload.exp
      if (exp) setExpiresAt(new Date(exp * 1000))
    })
  }, [])

  return (
    <div className="card">
      <h1>Welcome</h1>
      <dl>
        <dt>Email</dt>
        <dd>{email || '…'}</dd>
        <dt>User ID (sub)</dt>
        <dd><code>{user?.userId}</code></dd>
        <dt>ID token expires</dt>
        <dd>{expiresAt ? expiresAt.toLocaleString() : '…'}</dd>
      </dl>
      <button type="button" onClick={logout}>Sign out</button>
    </div>
  )
}
