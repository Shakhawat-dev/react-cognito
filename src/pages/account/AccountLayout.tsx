import { NavLink, Outlet } from 'react-router-dom'

// Shell for /account/*: one card with a tab per settings view, each on its own URL.
export default function AccountLayout() {
  return (
    <div className="card">
      <h1>Account</h1>
      <nav className="tabs">
        <NavLink to="profile">Profile</NavLink>
        <NavLink to="password">Password</NavLink>
      </nav>
      <Outlet />
    </div>
  )
}
