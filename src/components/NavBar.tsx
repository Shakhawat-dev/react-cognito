import { NavLink } from 'react-router-dom'
import { ADMIN_GROUP, useAuth } from '../auth/useAuth.ts'

export default function NavBar() {
  const { groups, logout } = useAuth()

  return (
    <nav className="nav">
      <NavLink to="/" end>Home</NavLink>
      <NavLink to="/account">Account</NavLink>
      {groups.includes(ADMIN_GROUP) && <NavLink to="/admin">Admin</NavLink>}
      <button type="button" onClick={logout}>Sign out</button>
    </nav>
  )
}
