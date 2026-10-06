import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signIn } from 'aws-amplify/auth'
import { useAuth } from '../auth/useAuth.ts'
import { errorMessage } from '../auth/errors.ts'

export default function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const { refresh } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const confirmed = (location.state as { confirmed?: boolean } | null)?.confirmed

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password })
      if (isSignedIn) {
        await refresh()
        navigate('/', { replace: true })
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        navigate(`/confirm?email=${encodeURIComponent(email)}`)
      } else {
        setError(`Additional step required: ${nextStep.signInStep}`)
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Sign in</h1>
      {confirmed && <p className="info">Email verified. You can sign in now.</p>}
      <label>
        Email
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Password
        <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
      <p className="alt">No account? <Link to="/signup">Create one</Link></p>
    </form>
  )
}
