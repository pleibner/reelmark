import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Link } from 'react-router-dom'
import { useFeedRefresh } from '../FeedRefreshContext'
import { type FeedItem, type FeedPageResponse, fetchFeed } from '../lib/api'

const FEED_PAGE_SIZE = 3

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
  const homeRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [items, setItems] = useState<FeedItem[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadInFlightRef = useRef(false)
  const nextCursorStateRef = useRef<string | null>(null)
  nextCursorStateRef.current = nextCursor

  useEffect(() => {
    let cancelled = false
    setItems([])
    setNextCursor(null)
    setError(null)
    setInitialLoading(true)
    setLoadingMore(false)

    fetchFeed(null, FEED_PAGE_SIZE)
      .then((page: FeedPageResponse) => {
        if (cancelled) return
        setItems(page.items)
        setNextCursor(page.nextCursor)
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Could not load feed')
        }
      })
      .finally(() => {
        if (!cancelled) {
          setInitialLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [feedEpoch])

  const loadMoreStable = useCallback(async () => {
    if (loadInFlightRef.current) return
    const cursor = nextCursorStateRef.current
    if (cursor === null) return

    loadInFlightRef.current = true
    setLoadingMore(true)
    try {
      const page = await fetchFeed(cursor, FEED_PAGE_SIZE)
      setItems((prev) => [...prev, ...page.items])
      setNextCursor(page.nextCursor)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load more')
    } finally {
      loadInFlightRef.current = false
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    const root = homeRef.current
    const target = sentinelRef.current
    if (!root || !target || initialLoading || nextCursor === null) {
      return
    }

    const observer = new IntersectionObserver(
      (observed) => {
        const hit = observed.some((e) => e.isIntersecting)
        if (hit) {
          void loadMoreStable()
        }
      },
      { root, rootMargin: '320px', threshold: 0 },
    )

    observer.observe(target)
    const flushVisible = () => {
      for (const entry of observer.takeRecords()) {
        if (entry.isIntersecting) {
          void loadMoreStable()
          return
        }
      }
    }
    queueMicrotask(flushVisible)
    requestAnimationFrame(flushVisible)

    return () => observer.disconnect()
  }, [initialLoading, nextCursor, loadMoreStable])

  let feedBody: ReactNode
  if (error && items.length === 0) {
    feedBody = <p className="text-error">{error}</p>
  } else if (initialLoading) {
    feedBody = (
      <p className="text-muted text-muted--flush">Loading your feed…</p>
    )
  } else if (items.length === 0) {
    feedBody = (
      <p className="text-muted text-muted--flush">
        When people you follow save videos, they’ll show up here.
      </p>
    )
  } else {
    feedBody = (
      <>
        {error ? (
          <p className="text-error feed-load-more-error" role="alert">
            {error}
          </p>
        ) : null}
        <ul className="feed-list">
          {items.map((item) => (
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
        {nextCursor === null ? null : (
          <div
            ref={sentinelRef}
            className="feed-sentinel"
            aria-hidden
          />
        )}
        {loadingMore ? (
          <p className="text-muted feed-load-more-hint">Loading more…</p>
        ) : null}
      </>
    )
  }

  return (
    <div className="home" ref={homeRef}>
      {feedBody}
    </div>
  )
}
