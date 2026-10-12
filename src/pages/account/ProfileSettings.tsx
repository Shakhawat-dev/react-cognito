import { useEffect, useState, type FormEvent } from 'react'
import { fetchUserAttributes, updateUserAttribute } from 'aws-amplify/auth'
import { errorMessage } from '../../auth/errors.ts'

export default function ProfileSettings() {
  const [name, setName] = useState('')
  // Last value stored in Cognito, so Save is only enabled when something changed.
  const [savedName, setSavedName] = useState('')
  const [email, setEmail] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchUserAttributes()
      .then((attrs) => {
        setName(attrs.name ?? '')
        setSavedName(attrs.name ?? '')
        setEmail(attrs.email ?? '')
        setLoaded(true)
      })
      .catch((err) => setError(errorMessage(err)))
  }, [])

  const trimmed = name.trim()
  const dirty = trimmed !== savedName

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setInfo('')
    if (!trimmed) {
      setError('Please enter your name.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await updateUserAttribute({ userAttribute: { attributeKey: 'name', value: trimmed } })
      setName(trimmed)
      setSavedName(trimmed)
      setInfo('Profile updated.')
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Name
        <input type="text" autoComplete="name" required disabled={!loaded} value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <label>
        Email
        <input type="email" disabled value={email} />
        <small>Your sign-in email can't be changed here.</small>
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      {info && <p className="info">{info}</p>}
      <button type="submit" disabled={!loaded || !dirty || submitting}>{submitting ? 'Saving…' : 'Save changes'}</button>
    </form>
  )
}
