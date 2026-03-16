import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { config } from '../config.js'
import { AppError } from '../lib/errors.js'
import { deriveHandle } from '../lib/handle.js'
import { getByHandle, getByGoogleId, upsertUser } from '../db/users.js'

const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'

interface GoogleUserInfo {
  id: string
  email: string
  name: string
  picture?: string
}

async function generateHandle(displayName: string): Promise<string> {
  const baseHandle = deriveHandle(displayName);
  let handle = baseHandle;
  while (await getByHandle(handle)) {
    handle = `${baseHandle}${Math.floor(1000 + Math.random() * 9000)}`
  }
  return handle
}

async function authRoutes(app: FastifyInstance) {
  app.get('/auth/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    const oauthToken = await app.googleOAuth.getAccessTokenFromAuthorizationCodeFlow(request)

    const profileRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${oauthToken.token.access_token}`,
      },
    })

    if (!profileRes.ok) {
      throw new AppError(
        'GOOGLE_AUTH_FAILED',
        'Failed to fetch Google profile',
        502,
      )
    }

    const profile = (await profileRes.json()) as GoogleUserInfo
    const googleId = profile.id
    const email = profile.email
    const displayName = profile.name
    const avatarUrl = profile.picture || null;

    const existingUser = await getByGoogleId(profile.id)

    const handle =  existingUser ? existingUser.handle : await generateHandle(displayName)

    const user = await upsertUser({
      googleId,
      handle,
      displayName,
      avatarUrl,
      email,
    })

    const jwt = await reply.jwtSign({
      sub: user.id,
      handle: user.handle,
    })

    return reply.redirect(`${config.appUrl}/auth/callback?token=${jwt}`)
  })
}

export default fp(authRoutes, { name: 'auth-routes' })
