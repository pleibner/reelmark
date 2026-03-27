import { pool } from './client.js'
import { ConflictError, NotFoundError } from '../lib/errors.js'

export type FollowListUser = {
  id: string
  handle: string
  displayName: string
  avatarUrl: string | null
}

function rowToFollowListUser(row: Record<string, unknown>): FollowListUser {
  return {
    id: row.id as string,
    handle: row.handle as string,
    displayName: row.display_name as string,
    avatarUrl: row.avatar_url as string | null,
  }
}

export async function listFollowers(followeeId: string): Promise<FollowListUser[]> {
  const { rows } = await pool.query(
    `SELECT u.id, u.handle, u.display_name, u.avatar_url
     FROM follows f
     JOIN users u ON u.id = f.follower_id
     WHERE f.followee_id = $1
     ORDER BY u.display_name ASC`,
    [followeeId],
  )
  return rows.map((r) => rowToFollowListUser(r))
}

export async function listFollowees(followerId: string): Promise<FollowListUser[]> {
  const { rows } = await pool.query(
    `SELECT u.id, u.handle, u.display_name, u.avatar_url
     FROM follows f
     JOIN users u ON u.id = f.followee_id
     WHERE f.follower_id = $1
     ORDER BY u.display_name ASC`,
    [followerId],
  )
  return rows.map((r) => rowToFollowListUser(r))
}

export async function insertFollow(
  followerId: string,
  followeeId: string
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO follows (follower_id, followee_id)
       VALUES ($1, $2)`,
      [followerId, followeeId]
    )
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      err.code === '23505'
    ) {
      throw new ConflictError('Already following this user')
    }
    throw err
  }
}

export async function deleteFollow(
  followerId: string,
  followeeId: string
): Promise<void> {
  const { rowCount } = await pool.query(
    'DELETE FROM follows WHERE follower_id = $1 AND followee_id = $2',
    [followerId, followeeId]
  )
  if (rowCount === 0) throw new NotFoundError('Follow relationship not found')
}

export async function isFollowing(
  followerId: string,
  followeeId: string
): Promise<boolean> {
  const { rows } = await pool.query(
    'SELECT 1 FROM follows WHERE follower_id = $1 AND followee_id = $2',
    [followerId, followeeId]
  )
  return rows.length > 0
}

export async function getFolloweeIds(followerId: string): Promise<string[]> {
  const { rows } = await pool.query(
    'SELECT followee_id FROM follows WHERE follower_id = $1',
    [followerId]
  )
  return rows.map((r) => r.followee_id as string)
}
