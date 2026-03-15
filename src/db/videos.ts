import type { Video } from '../types/index.js'
import { NotFoundError, ConflictError } from '../lib/errors.js'
import { pool } from './client.js'

function rowToVideo(row: Record<string, unknown>): Video {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    youtubeId: row.youtube_id as string,
    url: row.url as string,
    title: row.title as string | null,
    thumbnailUrl: row.thumbnail_url as string | null,
    channelName: row.channel_name as string | null,
    durationSecs: row.duration_secs as number | null,
    publishedAt: row.published_at === null || row.published_at === undefined ? null : new Date(row.published_at as string),
    fetchedAt: row.fetched_at === null || row.fetched_at === undefined ? null : new Date(row.fetched_at as string),
    createdAt: new Date(row.created_at as string),
  }
}

export async function insertVideo(params: {
  userId: string
  youtubeId: string
  url: string
}): Promise<Video> {
  try {
    const { rows } = await pool.query(
      `INSERT INTO videos (user_id, youtube_id, url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.userId, params.youtubeId, params.url]
    )
    return rowToVideo(rows[0])
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      err.code === '23505'
    ) {
      throw new ConflictError('You have already saved this video')
    }
    throw err
  }
}

export async function getById(id: string): Promise<Video | null> {
  const { rows } = await pool.query('SELECT * FROM videos WHERE id = $1', [id])
  return rows.length === 0 ? null : rowToVideo(rows[0])
}

export async function getByUserId(
  userId: string,
  limit = 50,
  offset = 0
): Promise<Video[]> {
  const { rows } = await pool.query(
    `SELECT * FROM videos WHERE user_id = $1 ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  )
  return rows.map((r) => rowToVideo(r))
}

export async function updateVideoMetadata(
  id: string,
  meta: {
    title?: string | null
    thumbnailUrl?: string | null
    channelName?: string | null
    durationSecs?: number | null
    publishedAt?: Date | null
    fetchedAt?: Date | null
  }
): Promise<Video | null> {
  const { rows } = await pool.query(
    `UPDATE videos SET
       title = COALESCE($2, title),
       thumbnail_url = COALESCE($3, thumbnail_url),
       channel_name = COALESCE($4, channel_name),
       duration_secs = COALESCE($5, duration_secs),
       published_at = COALESCE($6, published_at),
       fetched_at = COALESCE($7, fetched_at)
     WHERE id = $1 RETURNING *`,
    [
      id,
      meta.title ?? null,
      meta.thumbnailUrl ?? null,
      meta.channelName ?? null,
      meta.durationSecs ?? null,
      meta.publishedAt ?? null,
      meta.fetchedAt ?? null,
    ]
  )
  return rows.length === 0 ? null : rowToVideo(rows[0])
}

export async function deleteVideo(
  videoId: string,
  userId: string
): Promise<void> {
  const { rowCount } = await pool.query(
    'DELETE FROM videos WHERE id = $1 AND user_id = $2',
    [videoId, userId]
  )
  if (rowCount === 0) throw new NotFoundError('Video not found')
}
