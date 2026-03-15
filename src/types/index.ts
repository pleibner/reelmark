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
  id: string,
  cursorTs: Date
  video: Video
  savedBy: Pick<User, 'id' | 'handle' | 'displayName' | 'avatarUrl'>
}

export interface FeedPage {
  items: FeedItem[]
  nextCursor: string | null  // null means no more pages
}

export interface SuggestedUser {
  user: User
  score: number
}

export interface ApiError {
  error: {
    code: string
    message: string
  }
}

export interface JwtPayload {
  sub: string       // user.id
  handle: string
}

export interface ScrapeJobData {
  videoId: string   // reelmark DB id (uuid)
  youtubeId: string
}