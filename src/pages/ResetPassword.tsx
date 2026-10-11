import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmResetPassword, resetPassword } from 'aws-amplify/auth'
import { errorMessage } from '../auth/errors.ts'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setInfo('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await confirmResetPassword({ username: email, confirmationCode: code.trim(), newPassword: password })
      navigate('/login', { state: { passwordReset: true } })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResend() {
    setError('')
    setInfo('')
    try {
      await resetPassword({ username: email })
      setInfo(`A new code was sent to ${email}.`)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Reset password</h1>
      <p>Enter the code we emailed you and choose a new password.</p>
      <label>
        Email
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Reset code
        <input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
      </label>
      <label>
        New password
        <input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <small>At least 8 characters with uppercase, lowercase, a number and a symbol.</small>
      </label>
      <label>
        Confirm new password
        <input type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      {info && <p className="info">{info}</p>}
      <button type="submit" disabled={submitting}>{submitting ? 'Resetting…' : 'Reset password'}</button>
      <button type="button" className="link" onClick={handleResend} disabled={!email}>Resend code</button>
      <p className="alt"><Link to="/login">Back to sign in</Link></p>
    </form>
  )
}
