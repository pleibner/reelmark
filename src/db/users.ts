import type { User } from '../types/index.js'
import { pool } from './client.js'

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    googleId: row.google_id as string,
    handle: row.handle as string,
    displayName: row.display_name as string,
    avatarUrl: row.avatar_url as string | null,
    email: row.email as string,
    createdAt: new Date(row.created_at as string),
  }
}

export async function getByGoogleId(googleId: string): Promise<User | null> {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  )
  return rows.length === 0 ? null : rowToUser(rows[0])
}

export async function getByHandle(handle: string): Promise<User | null> {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE handle = $1',
    [handle]
  )
  return rows.length === 0 ? null : rowToUser(rows[0])
}

export async function getById(id: string): Promise<User | null> {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  return rows.length === 0 ? null : rowToUser(rows[0])
}

export async function upsertUser(params: {
  googleId: string
  handle: string
  displayName: string
  avatarUrl: string | null
  email: string
}): Promise<User> {
  const { rows } = await pool.query(
    `INSERT INTO users (google_id, handle, display_name, avatar_url, email)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (google_id) DO UPDATE SET
       display_name = EXCLUDED.display_name,
       avatar_url   = EXCLUDED.avatar_url,
       email        = EXCLUDED.email
     RETURNING *`,
    [params.googleId, params.handle, params.displayName, params.avatarUrl, params.email]
  )
  return rowToUser(rows[0])
}