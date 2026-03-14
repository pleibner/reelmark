function require(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback
}

export const config = {
  // Server
  port: Number.parseInt(optional('PORT', '3000'), 10),
  nodeEnv: optional('NODE_ENV', 'development'),
  isProduction: optional('NODE_ENV', 'development') === 'production',

  // Auth
  jwtSecret: require('JWT_SECRET'),
  jwtExpiresIn: optional('JWT_EXPIRES_IN', '7d'),

  // Google OAuth
  googleClientId: require('GOOGLE_CLIENT_ID'),
  googleClientSecret: require('GOOGLE_CLIENT_SECRET'),
  googleCallbackUrl: require('GOOGLE_CALLBACK_URL'),

  // YouTube Data API
  youtubeApiKey: require('YOUTUBE_API_KEY'),

  // Database (Neon)
  databaseUrl: require('DATABASE_URL'),

  // Redis (Upstash)
  redisUrl: require('REDIS_URL'),
  redisToken: optional('REDIS_TOKEN', ''),

  // App
  appUrl: require('APP_URL'),
} as const

export type Config = typeof config