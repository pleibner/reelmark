import { useEffect, useState, type SyntheticEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useFeedRefresh } from './FeedRefreshContext'
import { saveVideo } from './lib/api'
import { fireSaveCelebration } from './lib/saveCelebration'
import { clearStoredToken, getStoredToken, getViewerHandle } from './lib/auth'

function MenuIcon() {
  return (
    <svg
      className="nav__menu-toggle-icon"
      viewBox="0 0 24 18"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M1 1.5h22M1 9h22M1 16.5h22"
      />
    </svg>
  )
}

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { bumpFeed } = useFeedRefresh()
  const token = getStoredToken()
  const [videoUrl, setVideoUrl] = useState('')
  const [saveBusy, setSaveBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const viewerProfilePath = (() => {
    const h = getViewerHandle()
    return h ? `/users/${encodeURIComponent(h)}` : null
  })()

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    globalThis.addEventListener('keydown', onKeyDown)
    return () => globalThis.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  function logout() {
    clearStoredToken()
    navigate('/login', { replace: true })
  }

  async function handleSaveVideo(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    const url = videoUrl.trim()
    if (!url || saveBusy) return
    setSaveBusy(true)
    setSaveError(null)
    try {
      await saveVideo(url)
      setVideoUrl('')
      fireSaveCelebration()
      bumpFeed()
      setMenuOpen(false)
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : 'Could not save video',
      )
    } finally {
      setSaveBusy(false)
    }
  }

  return (
    <header
      className={`nav ${token ? 'nav--with-save' : ''} ${token && menuOpen ? 'nav--menu-open' : ''}`}
    >
      <div className="nav__bar">
        {token ? (
          <div className="nav__brand-row">
            <Link to="/" className="nav__brand">
              Reelmark
            </Link>
            <button
              type="button"
              className="nav__menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="nav-drawer"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="visually-hidden">
                {menuOpen ? 'Close menu' : 'Open menu'}
              </span>
              <MenuIcon />
            </button>
          </div>
        ) : (
          <Link to="/login" className="nav__brand">
            Reelmark
          </Link>
        )}
      </div>
      {token ? (
        <nav
          id="nav-drawer"
          className="nav__drawer"
          aria-label="Main navigation"
        >
          <form
            className="nav__save"
            onSubmit={handleSaveVideo}
            aria-labelledby="nav-save-heading"
          >
            <h2 id="nav-save-heading" className="nav__drawer-save-title">
              Save a video
            </h2>
            <label htmlFor="nav-save-url" className="nav__save-field-label">
              YouTube URL
            </label>
            <input
              id="nav-save-url"
              type="url"
              className="nav__save-input"
              name="url"
              value={videoUrl}
              onChange={(ev) => {
                setVideoUrl(ev.target.value)
                setSaveError(null)
              }}
              placeholder="Paste a link to save the video"
              autoComplete="off"
              disabled={saveBusy}
              enterKeyHint="done"
            />
            {saveError ? (
              <p className="nav__save-error" role="alert">
                {saveError}
              </p>
            ) : null}
          </form>
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
        </nav>
      ) : null}
      {token ? (
        <button
          type="button"
          className="nav__backdrop"
          aria-label="Close menu"
          tabIndex={menuOpen ? 0 : -1}
          aria-hidden={!menuOpen}
          onClick={() => setMenuOpen(false)}
        />
      ) : null}
    </header>
  )
}
