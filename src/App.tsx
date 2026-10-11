import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './auth/ProtectedRoute.tsx'
import SignIn from './pages/SignIn.tsx'
import SignUp from './pages/SignUp.tsx'
import ConfirmSignUp from './pages/ConfirmSignUp.tsx'
import ForgotPassword from './pages/ForgotPassword.tsx'
import ResetPassword from './pages/ResetPassword.tsx'
import Home from './pages/Home.tsx'
import './App.css'

function App() {
  return (
    <main className="app">
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>
        <Route path="/confirm" element={<ConfirmSignUp />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  )
}

export default App
