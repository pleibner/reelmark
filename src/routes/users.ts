import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { authenticate } from '../plugins/authenticate.js'
import { NotFoundError, ForbiddenError } from '../lib/errors.js'
import { getByHandle } from '../db/users.js'
import { getSuggestedUsers } from '../db/suggestions.js'
import { getByUserId } from '../db/videos.js'
import {
  insertFollow,
  deleteFollow,
  listFollowees,
  listFollowers,
} from '../db/follows.js'

const profileVideosLimit = 200

async function usersRoutes(app: FastifyInstance) {
  // Register GET /users/suggestions before GET /users/:handle so "suggestions" is not matched as a handle
  app.get<{
    Querystring: { limit?: number }
  }>(
    '/users/suggestions',
    {
      preHandler: authenticate,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            limit: { type: 'integer', minimum: 1, maximum: 50 },
          },
        },
      },
    },
    async (request) => {
      const limit = request.query.limit ?? 10
      return getSuggestedUsers(request.user.sub, limit)
    }
  )

  app.get<{
    Params: { handle: string }
  }>(
    '/users/:handle',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['handle'],
          properties: {
            handle: { type: 'string' },
          },
        },
      },
    },
    async (request) => {
      const user = await getByHandle(request.params.handle)
      if (user === null) {
        throw new NotFoundError('User not found')
      }
      const viewerId = request.user.sub
      const isSelf = user.id === viewerId
      const [videos, followers, following] = await Promise.all([
        getByUserId(user.id, profileVideosLimit, 0),
        listFollowers(user.id),
        listFollowees(user.id),
      ])
      return {
        user: {
          id: user.id,
          handle: user.handle,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          ...(isSelf ? { email: user.email } : {}),
        },
        videos,
        followers,
        following,
      }
    }
  )

  app.post<{
    Params: { handle: string }
  }>(
    '/follows/:handle',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['handle'],
          properties: {
            handle: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const targetUser = await getByHandle(request.params.handle)
      if (targetUser === null) {
        throw new NotFoundError('User not found')
      }
      if (targetUser.id === request.user.sub) {
        throw new ForbiddenError('You cannot follow yourself')
      }
      await insertFollow(request.user.sub, targetUser.id)
      return reply.status(204).send()
    }
  )

  app.delete<{
    Params: { handle: string }
  }>(
    '/follows/:handle',
    {
      preHandler: authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['handle'],
          properties: {
            handle: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const targetUser = await getByHandle(request.params.handle)
      if (targetUser === null) {
        throw new NotFoundError('User not found')
      }
      await deleteFollow(request.user.sub, targetUser.id)
      return reply.status(204).send()
    }
  )
}

export default fp(usersRoutes, { name: 'users-routes' })
