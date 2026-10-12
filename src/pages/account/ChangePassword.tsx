import { useState, type FormEvent } from 'react'
import { updatePassword } from 'aws-amplify/auth'
import { errorMessage } from '../../auth/errors.ts'
import Dialog from '../../components/Dialog.tsx'

export default function ChangePassword() {
  const [current, setCurrent] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [changed, setChanged] = useState(false)

  // Validate first, then ask for confirmation before calling Cognito.
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password === current) {
      setError('New password must be different from your current password.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setConfirming(true)
  }

  async function handleConfirm() {
    setConfirming(false)
    setSubmitting(true)
    try {
      await updatePassword({ oldPassword: current, newPassword: password })
      setCurrent('')
      setPassword('')
      setConfirm('')
      setChanged(true)
    } catch (err) {
      // Cognito reports a wrong current password as "Incorrect username or password."
      setError(err instanceof Error && err.name === 'NotAuthorizedException'
        ? 'Current password is incorrect.'
        : errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Current password
          <input type="password" autoComplete="current-password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
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
        <button type="submit" disabled={submitting}>{submitting ? 'Changing…' : 'Change password'}</button>
      </form>
      <Dialog
        open={confirming}
        title="Change password?"
        onClose={() => setConfirming(false)}
        actions={
          <>
            <button type="button" className="secondary" onClick={() => setConfirming(false)}>Cancel</button>
            <button type="button" onClick={handleConfirm}>Change password</button>
          </>
        }
      >
        <p>You'll need the new password the next time you sign in. Devices that are already signed in stay signed in.</p>
      </Dialog>
      <Dialog
        open={changed}
        title="Password changed"
        onClose={() => setChanged(false)}
        actions={<button type="button" onClick={() => setChanged(false)}>Done</button>}
      >
        <p>Your password was updated. Use the new password the next time you sign in.</p>
      </Dialog>
    </>
  )
}
