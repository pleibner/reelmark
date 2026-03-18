import type { SuggestedUser } from '../types/index.js'
import { pool } from './client.js'

export async function getSuggestedUsers(
  userId: string,
  limit = 10
): Promise<SuggestedUser[]> {
  // Score breakdown:
  // - Exact video match (same youtube_id): 3 points each
  // - Channel match (same channel_name): 1 point each
  // Users already followed and the requesting user are excluded.
  // Results ranked by total score descending.
  const { rows } = await pool.query(
    `WITH my_videos AS (
       SELECT youtube_id, channel_name
       FROM videos
       WHERE user_id = $1
     ),
     scores AS (
       SELECT
         u.id AS user_id,
         SUM(CASE
           WHEN v.youtube_id = mv.youtube_id THEN 3
           WHEN v.channel_name IS NOT NULL AND v.channel_name = mv.channel_name THEN 1
           ELSE 0
         END) AS score
       FROM users u
       LEFT JOIN videos v ON v.user_id = u.id
       LEFT JOIN my_videos mv
         ON v.youtube_id = mv.youtube_id
         OR (v.channel_name IS NOT NULL AND v.channel_name = mv.channel_name)
       WHERE u.id != $1
         AND u.id NOT IN (
           SELECT followee_id FROM follows WHERE follower_id = $1
         )
       GROUP BY u.id
     )
     SELECT
       u.id, u.google_id, u.handle, u.display_name,
       u.avatar_url, u.email, u.created_at,
       s.score
     FROM scores s
     JOIN users u ON u.id = s.user_id
     ORDER BY s.score DESC
     LIMIT $2`,
    [userId, limit]
  )

  return rows.map(row => ({
    user: {
      id: row.id as string,
      googleId: row.google_id as string,
      handle: row.handle as string,
      displayName: row.display_name as string,
      avatarUrl: row.avatar_url as string | null,
      email: row.email as string,
      createdAt: row.created_at as Date,
    },
    score: Number(row.score),
  }))
}