import { useState, type SyntheticEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useFeedRefresh } from './FeedRefreshContext'
import { saveVideo } from './lib/api'
import { fireSaveCelebration } from './lib/saveCelebration'
import { clearStoredToken, getStoredToken, getViewerHandle } from './lib/auth'

export function Navbar() {
  const navigate = useNavigate()
  const { bumpFeed } = useFeedRefresh()
  const token = getStoredToken()
  const [videoUrl, setVideoUrl] = useState('')
  const [saveBusy, setSaveBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const viewerProfilePath = (() => {
    const h = getViewerHandle()
    return h ? `/users/${encodeURIComponent(h)}` : null
  })()

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
    } catch (err: unknown) {
      setSaveError(
        err instanceof Error ? err.message : 'Could not save video',
      )
    } finally {
      setSaveBusy(false)
    }
  }

  return (
    <header className={`nav ${token ? 'nav--with-save' : ''}`}>
      <Link to={token ? '/' : '/login'} className="nav__brand">
        Reelmark
      </Link>
      {token ? (
        <>
          <form className="nav__save" onSubmit={handleSaveVideo}>
            <label htmlFor="nav-save-url" className="visually-hidden">
              YouTube URL to save
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
              placeholder="put a link here to save the video"
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
        </>
      ) : null}
    </header>
  )
}
