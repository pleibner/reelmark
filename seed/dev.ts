import 'dotenv/config'
import pg from 'pg'
import { config } from '../src/config.js'

const { Pool } = pg
const pool = new Pool({ connectionString: config.databaseUrl })

const users = [
  { googleId: 'seed_user_1', handle: 'alex_rivera', displayName: 'Alex Rivera', avatarUrl: null, email: 'alex@seed.dev' },
  { googleId: 'seed_user_2', handle: 'maya_chen', displayName: 'Maya Chen', avatarUrl: null, email: 'maya@seed.dev' },
  { googleId: 'seed_user_3', handle: 'jordan_lee', displayName: 'Jordan Lee', avatarUrl: null, email: 'jordan@seed.dev' },
  { googleId: 'seed_user_4', handle: 'sam_patel', displayName: 'Sam Patel', avatarUrl: null, email: 'sam@seed.dev' },
  { googleId: 'seed_user_5', handle: 'riley_kim', displayName: 'Riley Kim', avatarUrl: null, email: 'riley@seed.dev' },
]

const videos: {
  userHandle: string
  youtubeId: string
  url: string
  title: string
  thumbnailUrl: string
  channelName: string
  durationSecs: number
}[] = [
  { userHandle: 'alex_rivera', youtubeId: 'ko70cExuzZM', url: 'https://youtube.com/watch?v=ko70cExuzZM', title: 'Taylor Swift - The Fate of Ophelia (Official Music Video)', thumbnailUrl: 'https://img.youtube.com/vi/ko70cExuzZM/0.jpg', channelName: 'Taylor Swift', durationSecs: 239 },
  { userHandle: 'alex_rivera', youtubeId: 'd-jU0q5UVxo', url: 'https://youtube.com/watch?v=d-jU0q5UVxo', title: 'Dove Cameron - Sand (Official Video)', thumbnailUrl: 'https://img.youtube.com/vi/d-jU0q5UVxo/0.jpg', channelName: 'DoveCameronVEVO', durationSecs: 231 },

  { userHandle: 'maya_chen', youtubeId: 'q3zqJs7JUCQ', url: 'https://youtube.com/watch?v=q3zqJs7JUCQ', title: 'Taylor Swift - Fortnight (feat. Post Malone) (Official Music Video)', thumbnailUrl: 'https://img.youtube.com/vi/q3zqJs7JUCQ/0.jpg', channelName: 'Taylor Swift', durationSecs: 250 },
  { userHandle: 'maya_chen', youtubeId: 'odWKEfp2QMY', url: 'https://youtube.com/watch?v=odWKEfp2QMY', title: 'Måneskin - THE LONELIEST (Official Video)', thumbnailUrl: 'https://img.youtube.com/vi/odWKEfp2QMY/0.jpg', channelName: 'ManeskinVEVO', durationSecs: 288 },

  { userHandle: 'jordan_lee', youtubeId: 'ko70cExuzZM', url: 'https://youtube.com/watch?v=ko70cExuzZM', title: 'Taylor Swift - The Fate of Ophelia (Official Music Video)', thumbnailUrl: 'https://img.youtube.com/vi/ko70cExuzZM/0.jpg', channelName: 'Taylor Swift', durationSecs: 239 },
  { userHandle: 'jordan_lee', youtubeId: 'odWKEfp2QMY', url: 'https://youtube.com/watch?v=odWKEfp2QMY', title: 'Måneskin - THE LONELIEST (Official Video)', thumbnailUrl: 'https://img.youtube.com/vi/odWKEfp2QMY/0.jpg', channelName: 'ManeskinVEVO', durationSecs: 288 },

  { userHandle: 'sam_patel', youtubeId: 'd-jU0q5UVxo', url: 'https://youtube.com/watch?v=d-jU0q5UVxo', title: 'Dove Cameron - Sand (Official Video)', thumbnailUrl: 'https://img.youtube.com/vi/d-jU0q5UVxo/0.jpg', channelName: 'DoveCameronVEVO', durationSecs: 231 },
  { userHandle: 'sam_patel', youtubeId: 'rwlFWWGaZ5Y', url: 'https://youtube.com/watch?v=rwlFWWGaZ5Y', title: 'Tate McRae - Revolving door (Official Video)', thumbnailUrl: 'https://img.youtube.com/vi/rwlFWWGaZ5Y/0.jpg', channelName: 'TateMcRaeVEVO', durationSecs: 235 },

  { userHandle: 'riley_kim', youtubeId: 'rwlFWWGaZ5Y', url: 'https://youtube.com/watch?v=rwlFWWGaZ5Y', title: 'Tate McRae - Revolving door (Official Video)', thumbnailUrl: 'https://img.youtube.com/vi/rwlFWWGaZ5Y/0.jpg', channelName: 'TateMcRaeVEVO', durationSecs: 235 },
]

async function seed() {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Upsert users
    const userIds: Record<string, string> = {}
    for (const user of users) {
      const { rows } = await client.query(
        `INSERT INTO users (google_id, handle, display_name, avatar_url, email)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (google_id) DO UPDATE SET
           display_name = EXCLUDED.display_name
         RETURNING id`,
        [user.googleId, user.handle, user.displayName, user.avatarUrl, user.email]
      )
      userIds[user.handle] = rows[0].id
      console.log(`Upserted user: ${user.handle}`)
    }

    // Upsert videos
    for (const video of videos) {
      const userId = userIds[video.userHandle]
      await client.query(
        `INSERT INTO videos
           (user_id, youtube_id, url, title, thumbnail_url, channel_name, duration_secs, fetched_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, now())
         ON CONFLICT (user_id, youtube_id) DO NOTHING`,
        [userId, video.youtubeId, video.url, video.title, video.thumbnailUrl, video.channelName, video.durationSecs]
      )
      console.log(`Upserted video: ${video.title} (${video.userHandle})`)
    }

    await client.query('COMMIT')
    console.log('Seed complete')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})