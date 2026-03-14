// ─── Domain types (mirror DB rows) ───────────────────────────────────────────

export interface User {
  id: string
  googleId: string
  handle: string
  displayName: string
  avatarUrl: string | null
  email: string
  createdAt: Date
}

export interface Video {
  id: string
  userId: string
  youtubeId: string
  url: string
  title: string | null
  thumbnailUrl: string | null
  channelName: string | null
  durationSecs: number | null
  publishedAt: Date | null
  fetchedAt: Date | null
  createdAt: Date
}

export interface Follow {
  followerId: string
  followeeId: string
  createdAt: Date
}

export interface FeedItem {
  id: string
  ownerUserId: string
  videoId: string
  cursorTs: Date
  createdAt: Date
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiError {
  error: {
    code: string
    message: string
  }
}

// ─── JWT payload ─────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string       // user.id
  handle: string
}

// ─── BullMQ job data ─────────────────────────────────────────────────────────

export interface ScrapeJobData {
  videoId: string   // reelmark DB id (uuid)
  youtubeId: string
}