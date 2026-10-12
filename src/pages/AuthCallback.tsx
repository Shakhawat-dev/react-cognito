import { useEffect, useState, useSyncExternalStore } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { errorMessage } from '../auth/errors.ts'
import { getOAuthResult, subscribeOAuthResult } from '../auth/oauthResult.ts'
import { useAuth } from '../auth/useAuth.ts'

// How long to wait for Amplify to report on the code exchange. It is a single request to the
// token endpoint, so this only runs out when Amplify isn't handling the redirect at all
// (e.g. a stale or bookmarked callback URL, or one opened in a different browser).
const EXCHANGE_TIMEOUT_MS = 15_000

// The Hosted UI redirects here with ?code=…&state=… (or ?error=…). Amplify's OAuth listener
// exchanges the code for tokens on its own; this page waits for the result and then goes back
// to the page the user originally asked for.
//
// Don't treat "auth finished loading without a user" as a failure: Amplify only holds session
// reads for 5 minutes after signInWithRedirect, so after a slow Hosted UI visit (sign-up plus email
// verification, say) the first session read returns nothing while the exchange is still running.
export default function AuthCallback() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { returnTo, status, error } = useSyncExternalStore(subscribeOAuthResult, getOAuthResult)
  // Read once: Amplify strips the query string from the URL after the exchange.
  const [redirect] = useState(() => {
    const params = new URLSearchParams(location.search)
    return {
      hasCode: params.has('code'),
      // Cognito puts the reason for a failed sign-in in the query string.
      error: params.get('error_description') ?? params.get('error'),
    }
  })
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (status !== 'pending') return
    const timer = setTimeout(() => setTimedOut(true), EXCHANGE_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [status])

  // Signed in. After a successful exchange, wait for AuthContext to load the new user.
  if (!loading && user) return <Navigate to={returnTo ?? '/'} replace />
  if (!redirect.hasCode && !redirect.error) return <Navigate to="/login" replace />

  const failure =
    (status === 'failure' && errorMessage(error)) ||
    redirect.error ||
    (timedOut && status === 'pending' && 'Sign-in did not complete. Please try again.')

  if (failure) {
    return (
      <div className="card">
        <h1>Sign-in failed</h1>
        <p className="error" role="alert">{failure}</p>
        <p className="alt"><Link to="/login">Try again</Link></p>
      </div>
    )
  }
  return <p className="status">Signing in…</p>
}
