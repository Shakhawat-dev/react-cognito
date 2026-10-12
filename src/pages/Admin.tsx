import { useEffect, useState } from 'react'
import { fetchAuthSession } from 'aws-amplify/auth'
import { useAuth } from '../auth/useAuth.ts'

export default function Admin() {
  const { groups } = useAuth()
  const [claims, setClaims] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    fetchAuthSession().then(({ tokens }) => setClaims(tokens?.accessToken.payload ?? null))
  }, [])

  return (
    <div className="card">
      <h1>Admin</h1>
      <p>Only members of the admin group can see this page.</p>
      <dl>
        <dt>Your groups</dt>
        <dd>{groups.join(', ')}</dd>
        <dt>Access token claims</dt>
        <dd><pre>{claims ? JSON.stringify(claims, null, 2) : '…'}</pre></dd>
      </dl>
    </div>
  )
}
