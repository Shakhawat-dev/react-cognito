import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { signInWithRedirect } from 'aws-amplify/auth'
import { errorMessage } from '../auth/errors.ts'

// Sign-in, MFA, forced password change and forgot password all happen on Cognito's Hosted UI.
// This page only starts the OAuth (authorization code + PKCE) redirect.
export default function SignIn() {
  const location = useLocation()
  const [error, setError] = useState('')
  const [redirecting, setRedirecting] = useState(false)

  // Set by ProtectedRoute; carried through Cognito as OAuth custom state and read back in AuthCallback.
  const from = (location.state as { from?: { pathname: string; search: string } } | null)?.from
  const returnTo = from ? from.pathname + from.search : '/'

  async function handleSignIn() {
    setError('')
    setRedirecting(true)
    try {
      await signInWithRedirect({ customState: returnTo })
    } catch (err) {
      setError(errorMessage(err))
      setRedirecting(false)
    }
  }

  return (
    <div className="card">
      <h1>Sign in</h1>
      <p>You'll be taken to the secure sign-in page. Accounts are created by a user administrator.</p>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="button" onClick={handleSignIn} disabled={redirecting}>
        {redirecting ? 'Redirecting…' : 'Sign in'}
      </button>
    </div>
  )
}
