import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type FeedRefreshContextValue = {
  feedEpoch: number
  bumpFeed: () => void
}

const FeedRefreshContext = createContext<FeedRefreshContextValue | null>(null)

export function FeedRefreshProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [feedEpoch, setFeedEpoch] = useState(0)
  const bumpFeed = useCallback(() => {
    setFeedEpoch((n) => n + 1)
  }, [])
  const value = useMemo(
    () => ({ feedEpoch, bumpFeed }),
    [feedEpoch, bumpFeed],
  )
  return (
    <FeedRefreshContext.Provider value={value}>
      {children}
    </FeedRefreshContext.Provider>
  )
}

export function useFeedRefresh(): FeedRefreshContextValue {
  const ctx = useContext(FeedRefreshContext)
  if (!ctx) {
    throw new Error('useFeedRefresh must be used within FeedRefreshProvider')
  }
  return ctx
}
