import type { FastifyInstance } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyOauth2, { type OAuth2Namespace } from '@fastify/oauth2'
import fp from 'fastify-plugin'
import { config } from '../config.js'

async function oauthPlugin(app: FastifyInstance) {
  await app.register(fastifyCookie, {
    secret: config.jwtSecret,
  })

  await app.register(fastifyOauth2, {
    name: 'googleOAuth',
    credentials: {
      client: {
        id: config.googleClientId,
        secret: config.googleClientSecret,
      },
    },
    scope: ['openid', 'email', 'profile'],
    startRedirectPath: '/auth/google',
    callbackUri: config.googleCallbackUrl,
    discovery: {
      issuer: 'https://accounts.google.com',
    },
  })
}

declare module 'fastify' {
  interface FastifyInstance {
    googleOAuth: OAuth2Namespace
  }
}

export default fp(oauthPlugin, { name: 'oauth' })
