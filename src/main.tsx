import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Amplify } from 'aws-amplify'
// Completes the Hosted UI redirect (code -> tokens) on page load, whichever page imports signInWithRedirect.
import 'aws-amplify/auth/enable-oauth-listener'
// Must run before Amplify.configure() so no OAuth Hub event is missed.
import './auth/oauthResult.ts'
import outputs from '../amplify_outputs.json'
import { AuthProvider } from './auth/AuthContext.tsx'
import './index.css'
import App from './App.tsx'

Amplify.configure(outputs)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
