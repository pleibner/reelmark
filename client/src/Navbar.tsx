import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearStoredToken, getStoredToken } from './lib/auth'

const bar: CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0.75rem 1.25rem',
  borderBottom: '1px solid #e8e8e8',
  background: '#fff',
}

const brand: CSSProperties = {
  color: '#111',
  fontWeight: 600,
  fontSize: '1rem',
  letterSpacing: '-0.02em',
  textDecoration: 'none',
}

const logoutLink: CSSProperties = {
  color: '#111',
  fontSize: '0.875rem',
  textDecoration: 'underline',
  textUnderlineOffset: '0.15em',
  cursor: 'pointer',
  background: 'none',
  border: 'none',
  font: 'inherit',
  padding: 0,
}

export function Navbar() {
  const navigate = useNavigate()
  const token = getStoredToken()

  function logout() {
    clearStoredToken()
    navigate('/login', { replace: true })
  }

  return (
    <header style={bar}>
      <Link to={token ? '/' : '/login'} style={brand}>
        Reelmark
      </Link>
      {token ? (
        <button type="button" onClick={logout} style={logoutLink}>
          Log out
        </button>
      ) : null}
    </header>
  )
}
