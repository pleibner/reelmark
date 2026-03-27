import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { type UserProfileResponse, fetchUserByHandle } from '../lib/api'
import { getViewerHandle } from '../lib/auth'

export function ProfilePage() {
  const { handle: handleParam } = useParams<{ handle: string }>()
  const handle = handleParam?.trim() ?? ''
  const [data, setData] = useState<UserProfileResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!handle) return
    let cancelled = false
    setError(null)
    setData(null)
    fetchUserByHandle(handle)
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load profile')
        }
      })
    return () => {
      cancelled = true
    }
  }, [handle])

  if (!handle) {
    return <Navigate to="/" replace />
  }

  if (error) {
    return (
      <div className="page page--narrow">
        <p className="text-error">{error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="page page--narrow">
        <p className="text-muted text-muted--flush">Loading…</p>
      </div>
    )
  }

  const { user, videos, followers, following } = data
  const viewerHandle = getViewerHandle()
  const isSelf = viewerHandle === user.handle

  const joined = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="page page--narrow">
      <h1 className="page-title">Profile</h1>
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" className="avatar" />
      ) : null}
      {isSelf ? (
        <p className="text-muted text-muted--note">Synced from Google</p>
      ) : null}
      <div className="field">
        <div className="field__label">Name</div>
        <p className="field__value">{user.displayName}</p>
      </div>
      <div className="field">
        <div className="field__label">Handle</div>
        <p className="field__value">@{user.handle}</p>
      </div>
      {user.email ? (
        <div className="field">
          <div className="field__label">Email</div>
          <p className="field__value">{user.email}</p>
        </div>
      ) : null}
      <div className="field">
        <div className="field__label">Member since</div>
        <p className="field__value">{joined}</p>
      </div>

      <section className="section-block" aria-labelledby="profile-videos-heading">
        <h2 id="profile-videos-heading" className="section-title">
          Saved videos
        </h2>
        {videos.length === 0 ? (
          <p className="text-muted text-muted--flush">No videos yet.</p>
        ) : (
          <ul className="video-list">
            {videos.map((v) => (
              <li key={v.id} className="video-row">
                {v.thumbnailUrl ? (
                  <img src={v.thumbnailUrl} alt="" className="video-thumb" />
                ) : (
                  <div
                    className="video-thumb video-thumb--placeholder"
                    aria-hidden
                  />
                )}
                <div className="video-row__body">
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    className="link-external"
                  >
                    {v.title?.trim() ? v.title : 'YouTube Video'}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="section-block"
        aria-labelledby="profile-followers-heading"
      >
        <h2 id="profile-followers-heading" className="section-title">
          Followers
        </h2>
        {followers.length === 0 ? (
          <p className="text-muted text-muted--flush">None yet.</p>
        ) : (
          <ul className="person-list">
            {followers.map((p) => (
              <li key={p.id} className="person-row">
                <Link
                  to={`/users/${encodeURIComponent(p.handle)}`}
                  className="person-link"
                >
                  {p.displayName}{' '}
                  <span className="person-handle">@{p.handle}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="section-block"
        aria-labelledby="profile-following-heading"
      >
        <h2 id="profile-following-heading" className="section-title">
          Following
        </h2>
        {following.length === 0 ? (
          <p className="text-muted text-muted--flush">
            Not following anyone yet.
          </p>
        ) : (
          <ul className="person-list">
            {following.map((p) => (
              <li key={p.id} className="person-row">
                <Link
                  to={`/users/${encodeURIComponent(p.handle)}`}
                  className="person-link"
                >
                  {p.displayName}{' '}
                  <span className="person-handle">@{p.handle}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
