import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('Missing DATABASE_URL')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString })

const SCHEMA_MIGRATIONS = `
CREATE TABLE IF NOT EXISTS schema_migrations (
  id          SERIAL PRIMARY KEY,
  filename    TEXT UNIQUE,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
`

async function run(): Promise<void> {
  const client = await pool.connect()
  try {
    await client.query(SCHEMA_MIGRATIONS)

    const files = fs.readdirSync(__dirname).filter((f) => f.endsWith('.sql')).sort()

    for (const filename of files) {
      const { rows } = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [filename]
      )
      if (rows && rows.length > 0) {
        console.log(`Skipping ${filename} (already applied)`)
        continue
      }

      const sql = fs.readFileSync(path.join(__dirname, filename), 'utf-8')

      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [filename]
        )
        await client.query('COMMIT')
        console.log(`Applied: ${filename}`)
      } catch (err) {
        await client.query('ROLLBACK')
        throw err
      }
    }

    console.log('Migrations complete.')
  } finally {
    client.release()
    await pool.end()
  }
}

try {
  await run()
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
