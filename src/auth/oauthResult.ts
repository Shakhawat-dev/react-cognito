import { Hub } from 'aws-amplify/utils'

// Outcome of a Hosted UI redirect, read by AuthCallback.
export type OAuthResult = {
  // In-app path passed to signInWithRedirect as customState.
  returnTo: string | null
  // Set once Amplify has finished the code exchange, one way or the other.
  status: 'pending' | 'success' | 'failure'
  error: unknown
}

let result: OAuthResult = { returnTo: null, status: 'pending', error: null }
const listeners = new Set<() => void>()

// Only accept in-app paths, never a full or protocol-relative URL.
function safePath(path: string) {
  return path.startsWith('/') && !path.startsWith('//') ? path : null
}

// Registered when this module is imported, i.e. before main.tsx calls Amplify.configure() and the
// code exchange starts. A failed redirect (?error=…) is reported without any network call, so a
// listener added later from a component's effect could miss it.
Hub.listen('auth', ({ payload }) => {
  switch (payload.event) {
    case 'customOAuthState':
      result = { ...result, returnTo: safePath(payload.data) }
      break
    case 'signInWithRedirect':
      result = { ...result, status: 'success' }
      break
    case 'signInWithRedirect_failure':
      result = { ...result, status: 'failure', error: payload.data.error }
      break
    default:
      return
  }
  listeners.forEach((listener) => listener())
})

export function subscribeOAuthResult(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getOAuthResult() {
  return result
}
