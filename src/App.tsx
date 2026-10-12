import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute, PublicOnlyRoute } from './auth/ProtectedRoute.tsx'
import { ADMIN_GROUP, useAuth } from './auth/useAuth.ts'
import NavBar from './components/NavBar.tsx'
import SignIn from './pages/SignIn.tsx'
import AuthCallback from './pages/AuthCallback.tsx'
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
          </Route>
          <Route path="/auth/callback" element={<AuthCallback />} />
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
