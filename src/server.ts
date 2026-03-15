import 'dotenv/config'
import { buildApp } from './app.js'
import { config } from './config.js'

const app = await buildApp()

const close = async () => {
  await app.close()
  process.exit(0)
}

process.on('SIGINT', close)   // Cmd+C
process.on('SIGTERM', close)  // Docker stop

try {
  await app.listen({ port: config.port, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}