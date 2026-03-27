import type { FeedPage } from '../types/index.js'
import { pool } from './client.js'

export interface FeedCursor {
  cursorTs: Date
  id: string
}

/** Adds the video to each follower's feed and to the saver's own feed. */
export async function fanoutToFollowers(
  videoId: string,
  userId: string,
  createdAt: Date
): Promise<void> {
  await pool.query(
    `INSERT INTO feed_items (owner_user_id, video_id, cursor_ts)
     SELECT follower_id, $1::uuid, $2::timestamptz
     FROM follows
     WHERE followee_id = $3::uuid
     UNION ALL
     SELECT $3::uuid, $1::uuid, $2::timestamptz
     ON CONFLICT (owner_user_id, video_id) DO NOTHING`,
    [videoId, createdAt, userId]
  )
}

export async function getFeedPage(
  userId: string,
  cursor: string | null,
  limit = 20
): Promise<FeedPage> {
  const cursorParts = cursor ? cursor.split('_') : null
  const cursorTs = cursorParts ? cursorParts[0] : null
  const cursorId = cursorParts ? cursorParts[1] : null

  const { rows } = await pool.query(
    `SELECT
       fi.id            AS feed_item_id,
       fi.cursor_ts,
       v.id             AS video_id,
       v.user_id,
       v.youtube_id,
       v.url,
       v.title,
       v.thumbnail_url,
       v.channel_name,
       v.duration_secs,
       v.published_at,
       v.fetched_at,
       v.created_at     AS video_created_at,
       u.id             AS saver_id,
       u.handle         AS saver_handle,
       u.display_name   AS saver_display_name,
       u.avatar_url     AS saver_avatar_url
     FROM feed_items fi
     JOIN videos v ON v.id = fi.video_id
     JOIN users u  ON u.id = v.user_id
     WHERE fi.owner_user_id = $1
       AND (
         $2::timestamptz IS NULL
         OR fi.cursor_ts < $2::timestamptz
         OR (fi.cursor_ts = $2::timestamptz AND fi.id < $3::uuid)
       )
     ORDER BY fi.cursor_ts DESC, fi.id DESC
     LIMIT $4`,
    [userId, cursorTs, cursorId, limit + 1]
  )

  const hasNextPage = rows.length > limit
  const items = hasNextPage ? rows.slice(0, limit) : rows

  const lastItem = items[items.length - 1]
  const nextCursor = hasNextPage && lastItem
    ? `${(lastItem.cursor_ts as Date).toISOString()}_${lastItem.feed_item_id}`
    : null


  return {
    items: items.map(row => ({
      id: row.feed_item_id as string,
      cursorTs: row.cursor_ts as Date,
      video: {
        id: row.video_id as string,
        userId: row.user_id as string,
        youtubeId: row.youtube_id as string,
        url: row.url as string,
        title: row.title as string | null,
        thumbnailUrl: row.thumbnail_url as string | null,
        channelName: row.channel_name as string | null,
        durationSecs: row.duration_secs as number | null,
        publishedAt: row.published_at as Date | null,
        fetchedAt: row.fetched_at as Date | null,
        createdAt: row.video_created_at as Date,
      },
      savedBy: {
        id: row.saver_id as string,
        handle: row.saver_handle as string,
        displayName: row.saver_display_name as string,
        avatarUrl: row.saver_avatar_url as string | null,
      },
    })),
    nextCursor,
  }
}