import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { authenticate } from '../plugins/authenticate.js'
import { ValidationError } from '../lib/errors.js'
import { extractYoutubeId } from '../lib/youtube.js'
import { insertVideo as createVideo, deleteVideo } from '../db/videos.js'
import { fanoutToFollowers } from '../db/feed.js'
import { scrapeQueue } from '../lib/queue.js'

interface CreateVideoBody {
  url: string
}

interface DeleteVideoParams {
  id: string
}

async function videosRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateVideoBody }>(
    '/videos',
    {
      preHandler: authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', format: 'uri' },
          },
        },
      },
    },
    async (request, reply) => {
      const youtubeId = extractYoutubeId(request.body.url)
      if (youtubeId === null) {
        throw new ValidationError('Invalid YouTube URL')
      }

      const video = await createVideo({
        userId: request.user.sub,
        youtubeId,
        url: request.body.url,
      })

      await fanoutToFollowers(video.id, video.userId, video.createdAt)

      try {
        await scrapeQueue.add('scrape', { videoId: video.id, youtubeId: video.youtubeId })
      } catch (err) {
        request.log.error({ err }, 'Failed to enqueue scrape job')
      }

      return reply.status(201).send(video)
    }
  )

  app.delete<{ Params: DeleteVideoParams }>(
    '/videos/:id',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request, reply) => {
      await deleteVideo(request.params.id, request.user.sub)
      return reply.status(204).send()
    }
  )
}

export default fp(videosRoutes, { name: 'videos-routes' })
