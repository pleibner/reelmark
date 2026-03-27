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
