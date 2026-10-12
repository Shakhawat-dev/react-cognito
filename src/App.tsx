import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './auth/ProtectedRoute.tsx'
import { ADMIN_GROUP, useAuth } from './auth/useAuth.ts'
import NavBar from './components/NavBar.tsx'
import SignIn from './pages/SignIn.tsx'
import SignUp from './pages/SignUp.tsx'
import ConfirmSignUp from './pages/ConfirmSignUp.tsx'
import ForgotPassword from './pages/ForgotPassword.tsx'
import ResetPassword from './pages/ResetPassword.tsx'
import Home from './pages/Home.tsx'
import AccountLayout from './pages/account/AccountLayout.tsx'
import ProfileSettings from './pages/account/ProfileSettings.tsx'
import ChangePassword from './pages/account/ChangePassword.tsx'
import Admin from './pages/Admin.tsx'
import './App.css'

function App() {
  const { user } = useAuth()

  return (
    <>
      {user && <NavBar />}
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
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<Navigate to="profile" replace />} />
              <Route path="profile" element={<ProfileSettings />} />
              <Route path="password" element={<ChangePassword />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute group={ADMIN_GROUP} />}>
            <Route path="/admin" element={<Admin />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}

export default App
