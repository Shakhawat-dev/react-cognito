import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'
import { errorMessage } from '../auth/errors.ts'

export default function ConfirmSignUp() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [email, setEmail] = useState(params.get('email') ?? '')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setInfo('')
    setSubmitting(true)
    try {
      await confirmSignUp({ username: email, confirmationCode: code.trim() })
      navigate('/login', { state: { confirmed: true } })
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
      await resendSignUpCode({ username: email })
      setInfo(`A new code was sent to ${email}.`)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h1>Verify your email</h1>
      <p>Enter the code we emailed you.</p>
      <label>
        Email
        <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label>
        Verification code
        <input inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(e) => setCode(e.target.value)} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      {info && <p className="info">{info}</p>}
      <button type="submit" disabled={submitting}>{submitting ? 'Verifying…' : 'Confirm'}</button>
      <button type="button" className="link" onClick={handleResend} disabled={!email}>Resend code</button>
      <p className="alt"><Link to="/login">Back to sign in</Link></p>
    </form>
  )
}
