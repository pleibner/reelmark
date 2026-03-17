import Fastify, { type FastifyError } from 'fastify'
import { config } from './config.js'
import { AppError } from './lib/errors.js'
import { connectDb } from './db/client.js'
import oauthPlugin from './plugins/oauth.js'
import authenticatePlugin from './plugins/authenticate.js'
import authRoutes from './routes/auth.js'
import videosRoutes from './routes/videos.js'

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: config.isProduction ? 'info' : 'debug',
      ...(config.isProduction
        ? {}
        : {
            transport: {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'HH:MM:ss' },
            },
          }),
    },
    genReqId: () => crypto.randomUUID(),
  })

  await connectDb()

  await app.register(oauthPlugin)
  await app.register(authenticatePlugin)
  await app.register(authRoutes)
  await app.register(videosRoutes)

  app.setErrorHandler((error, request, reply) => {
    if ((error as FastifyError).validation) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: (error as FastifyError).message,
        },
      })
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
        },
      })
    }

    request.log.error({ err: error }, 'Unhandled error')
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong',
      },
    })
  })

  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
      },
    })
  })

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? 'unknown',
  }))

  return app
}