import 'dotenv/config'
import { Worker, Job } from 'bullmq'
import pino from 'pino'
import { config } from '../config.js'
import { redis } from '../lib/redis.js'
import { fetchVideoMetadata } from '../lib/youtube.js'
import { updateVideoMetadata } from '../db/videos.js'
import type { ScrapeJobData } from '../types/index.js'

const logger = pino({
  level: config.isProduction ? 'info' : 'debug',
  ...(config.isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss' },
        },
      }),
})

const worker = new Worker<ScrapeJobData>(
  'scrape',
  async (job: Job<ScrapeJobData>) => {
    const { videoId, youtubeId } = job.data
    logger.info({ videoId, youtubeId, attempt: job.attemptsMade + 1 }, 'Processing scrape job')

    const meta = await fetchVideoMetadata(youtubeId)

    if (meta === null) {
      logger.warn({ videoId, youtubeId }, 'Video not found on YouTube, skipping metadata update')
      return
    }

    await updateVideoMetadata(videoId, meta)

    logger.info({ videoId, title: meta.title }, 'Metadata saved')
  },
  {
    connection: redis,
    concurrency: 3,
  }
)

worker.on('failed', (job, err) => {
  logger.error(
    { videoId: job?.data.videoId, err, attempt: job?.attemptsMade },
    'Scrape job failed'
  )
})

worker.on('completed', (job) => {
  logger.info({jobId: job.id}, 'Job completed')
})

async function shutdown() {
  logger.info('Shutting down worker...')
  await worker.close()
  await redis.quit()
  process.exit(0)
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

logger.info('Scrape worker started')
