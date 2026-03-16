import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fastifyJwt from '@fastify/jwt'
import fp from 'fastify-plugin'
import { config } from '../config.js'
import { UnauthorizedError } from '../lib/errors.js'
import type { JwtPayload } from '../types/index.js'

async function authenticatePlugin(app: FastifyInstance) {
  await app.register(fastifyJwt, {
    secret: config.jwtSecret,
    sign: {
      expiresIn: config.jwtExpiresIn,
    },
  })

  app.decorateRequest(
    'authenticate',
    async function (this: FastifyRequest) {
      try {
        const payload = await this.jwtVerify<JwtPayload>()
        this.user = payload
      } catch {
        throw new UnauthorizedError('Missing or invalid token')
      }
    },
  )
}

declare module 'fastify' {
  interface FastifyRequest {
    authenticate(): Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: JwtPayload
  }
}

/**
 * Standalone preHandler that runs request.authenticate().
 * Use in route options: fastify.get('/feed', { preHandler: authenticate }, handler)
 */
export async function authenticate(
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> {
  await request.authenticate()
}

export default fp(authenticatePlugin, { name: 'authenticate' })
