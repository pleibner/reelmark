import { Queue } from 'bullmq'
import { redis } from './redis.js'
import type { ScrapeJobData } from '../types/index.js'

export const scrapeQueue = new Queue<ScrapeJobData>('scrape', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
})