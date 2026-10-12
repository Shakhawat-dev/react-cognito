import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth.ts'

export default function Forbidden({ group }: { group: string }) {
  const { refresh } = useAuth()
  const [refreshing, setRefreshing] = useState(false)

  // Group changes only show up in new tokens, so a user who was just added to the
  // group needs a token refresh (or to sign in again) before they get access.
  async function handleRefresh() {
    setRefreshing(true)
    await refresh({ forceRefresh: true })
    setRefreshing(false)
  }

  return (
    <div className="card">
      <h1>Not authorized</h1>
      <p>This page is only for members of the <code>{group}</code> group.</p>
      <p>
        <small>Just added to the group? Refresh your session to load the new membership.</small>
      </p>
      <button type="button" onClick={handleRefresh} disabled={refreshing}>
        {refreshing ? 'Refreshing…' : 'Refresh session'}
      </button>
      <p className="alt"><Link to="/">Back to home</Link></p>
    </div>
  )
}
