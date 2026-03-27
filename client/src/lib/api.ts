import { getApiBase, getStoredToken } from './auth'

export type ProfileUser = {
  id: string
  handle: string
  displayName: string
  avatarUrl: string | null
  createdAt: string
  email?: string
}

export type ProfileVideo = {
  id: string
  userId: string
  youtubeId: string
  url: string
  title: string | null
  thumbnailUrl: string | null
  channelName: string | null
  durationSecs: number | null
  publishedAt: string | null
  fetchedAt: string | null
  createdAt: string
}

export type FollowListUser = {
  id: string
  handle: string
  displayName: string
  avatarUrl: string | null
}

export type UserProfileResponse = {
  user: ProfileUser
  videos: ProfileVideo[]
  followers: FollowListUser[]
  following: FollowListUser[]
  /** Present when viewing another user's profile */
  isFollowing?: boolean
}

export async function followUser(handle: string): Promise<void> {
  const token = getStoredToken()
  if (!token) throw new Error('Not signed in')
  const res = await fetch(
    `${getApiBase()}/follows/${encodeURIComponent(handle)}`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null
    const msg = body?.error?.message ?? `Request failed (${res.status})`
    throw new Error(msg)
  }
}

export async function unfollowUser(handle: string): Promise<void> {
  const token = getStoredToken()
  if (!token) throw new Error('Not signed in')
  const res = await fetch(
    `${getApiBase()}/follows/${encodeURIComponent(handle)}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null
    const msg = body?.error?.message ?? `Request failed (${res.status})`
    throw new Error(msg)
  }
}

export type FeedItem = {
  id: string
  cursorTs: string
  video: ProfileVideo
  savedBy: FollowListUser
}

export type FeedPageResponse = {
  items: FeedItem[]
  nextCursor: string | null
}

/** Matches GET /users/suggestions — ordered by score descending; score is omitted in UI. */
export type SuggestionEntry = {
  user: FollowListUser
  score: number
}

export async function fetchSuggestions(limit = 50): Promise<SuggestionEntry[]> {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Not signed in')
  }
  const params = new URLSearchParams()
  params.set('limit', String(Math.min(50, Math.max(1, limit))))
  const res = await fetch(
    `${getApiBase()}/users/suggestions?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null
    const msg = body?.error?.message ?? `Request failed (${res.status})`
    throw new Error(msg)
  }
  return res.json() as Promise<SuggestionEntry[]>
}

export async function fetchFeed(
  cursor?: string | null,
  limit = 20,
): Promise<FeedPageResponse> {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Not signed in')
  }
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  if (cursor) {
    params.set('cursor', cursor)
  }
  const res = await fetch(`${getApiBase()}/feed?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null
    const msg = body?.error?.message ?? `Request failed (${res.status})`
    throw new Error(msg)
  }
  return res.json() as Promise<FeedPageResponse>
}

export async function fetchUserByHandle(
  handle: string,
): Promise<UserProfileResponse> {
  const token = getStoredToken()
  if (!token) {
    throw new Error('Not signed in')
  }
  const path = `/users/${encodeURIComponent(handle)}`
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null
    const msg = body?.error?.message ?? `Request failed (${res.status})`
    throw new Error(msg)
  }
  return res.json() as Promise<UserProfileResponse>
}
