import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { authenticate } from '../plugins/authenticate.js'
import { getFeedPage } from '../db/feed.js'

async function feedRoutes(app: FastifyInstance) {
  app.get<{
    Querystring: { cursor?: string; limit?: number }
  }>(
    '/feed',
    {
      preHandler: authenticate,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            cursor: { type: 'string' },
            limit: { type: 'integer', minimum: 1, maximum: 50 },
          },
        },
      },
    },
    async (request) => {
      const limit = request.query.limit ?? 20
      const cursor = request.query.cursor ?? null
      return getFeedPage(request.user.sub, cursor, limit)
    }
  )
}

export default fp(feedRoutes, { name: 'feed-routes' })
