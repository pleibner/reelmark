import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { type SuggestionEntry, fetchSuggestions } from '../lib/api'

function displayInitial(displayName: string): string {
  const ch = displayName.trim().charAt(0)
  return ch ? ch.toLocaleUpperCase() : '?'
}

export function DiscoverPage() {
  const [entries, setEntries] = useState<SuggestionEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchSuggestions(50)
      .then((rows) => {
        if (!cancelled) setEntries(rows)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load suggestions')
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <div className="page page--narrow">
        <p className="text-error">{error}</p>
      </div>
    )
  }

  if (entries === null) {
    return (
      <div className="discover">
        <h1 className="discover__title page-title">Discover</h1>
        <p className="text-muted text-muted--flush">Loading…</p>
      </div>
    )
  }

  return (
    <div className="discover">
      <h1 className="discover__title page-title">Discover</h1>
      {entries.length === 0 ? (
        <p className="text-muted text-muted--flush">
          No suggestions yet — save some videos to find people with similar tastes.
        </p>
      ) : (
        <ul className="discover__grid">
          {entries.map(({ user }) => (
            <li key={user.id} className="discover__cell">
              <Link
                to={`/users/${encodeURIComponent(user.handle)}`}
                className="discover-card"
              >
                <div className="discover-card__avatar-wrap">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="discover-card__avatar"
                    />
                  ) : (
                    <div
                      className="discover-card__avatar discover-card__avatar--initial"
                      aria-hidden
                    >
                      {displayInitial(user.displayName)}
                    </div>
                  )}
                </div>
                <div className="discover-card__name">{user.displayName}</div>
                <div className="discover-card__handle">@{user.handle}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
