import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useFeedRefresh } from '../FeedRefreshContext'
import { type FeedPageResponse, fetchFeed } from '../lib/api'

function formatSavedAt(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function videoTitle(title: string | null | undefined): string {
  return title?.trim() ? title : 'YouTube Video'
}

export function HomePage() {
  const { feedEpoch } = useFeedRefresh()
  const [feedPage, setFeedPage] = useState<FeedPageResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setFeedPage(null)
    setError(null)
    fetchFeed()
      .then((page) => {
        if (!cancelled) setFeedPage(page)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load feed')
        }
      })
    return () => {
      cancelled = true
    }
  }, [feedEpoch])

  let feedBody: ReactNode
  if (error) {
    feedBody = <p className="text-error">{error}</p>
  } else if (feedPage === null) {
    feedBody = (
      <p className="text-muted text-muted--flush">Loading your feed…</p>
    )
  } else if (feedPage.items.length === 0) {
    feedBody = (
      <p className="text-muted text-muted--flush">
        When people you follow save videos, they’ll show up here.
      </p>
    )
  } else {
    feedBody = (
      <ul className="feed-list">
        {feedPage.items.map((item) => (
          <li key={item.id} className="feed-card">
            <div className="feed-embed">
              <iframe
                src={`https://www.youtube.com/embed/${encodeURIComponent(item.video.youtubeId)}`}
                title={videoTitle(item.video.title)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
            <p className="feed-meta">
              Saved by{' '}
              <Link
                to={`/users/${encodeURIComponent(item.savedBy.handle)}`}
                className="feed-meta__name"
              >
                {item.savedBy.displayName}
              </Link>
              {' · '}
              <time dateTime={item.cursorTs}>
                {formatSavedAt(item.cursorTs)}
              </time>
            </p>
          </li>
        ))}
      </ul>
    )
  }

  return <div className="home">{feedBody}</div>
}
