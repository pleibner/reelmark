import { Link, useNavigate } from 'react-router-dom'
import { clearStoredToken, getStoredToken, getViewerHandle } from './lib/auth'

export function Navbar() {
  const navigate = useNavigate()
  const token = getStoredToken()
  const viewerProfilePath = (() => {
    const h = getViewerHandle()
    return h ? `/users/${encodeURIComponent(h)}` : null
  })()

  function logout() {
    clearStoredToken()
    navigate('/login', { replace: true })
  }

  return (
    <header className="nav">
      <Link to={token ? '/' : '/login'} className="nav__brand">
        Reelmark
      </Link>
      {token ? (
        <div className="nav__actions">
          <Link to="/" className="btn-text">
            Feed
          </Link>
          <Link to="/discover" className="btn-text">
            Discover
          </Link>
          {viewerProfilePath ? (
            <Link to={viewerProfilePath} className="btn-text">
              Profile
            </Link>
          ) : null}
          <button type="button" onClick={logout} className="btn-text">
            Log out
          </button>
        </div>
      ) : null}
    </header>
  )
}
