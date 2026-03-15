import pg from 'pg'
import { config } from '../config.js'

const pool = new pg.Pool({
  connectionString: config.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
})

export { pool }

export async function connectDb(): Promise<void> {
  const client = await pool.connect()
  client.release()
}
