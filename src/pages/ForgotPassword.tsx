import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { resetPassword } from 'aws-amplify/auth'
import { errorMessage } from '../auth/errors.ts'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const { nextStep } = await resetPassword({ username: email })
      if (nextStep.resetPasswordStep === 'CONFIRM_RESET_PASSWORD_WITH_CODE') {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`)
      } else {
        navigate('/login', { state: { passwordReset: true } })
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Forgot password</h1>
      <p>Enter your email and we'll send you a code to reset your password.</p>
      <label>
        Email
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      <button type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send reset code'}</button>
      <p className="alt">Already have a code? <Link to={`/reset-password${email ? `?email=${encodeURIComponent(email)}` : ''}`}>Reset password</Link></p>
      <p className="alt"><Link to="/login">Back to sign in</Link></p>
    </form>
  )
}
