// Environment is loaded via --env-file=.env flag in npm scripts
import { buildApp } from './app.js'

const PORT = parseInt(process.env.PORT ?? '3000', 10)

const app = await buildApp()

try {
  await app.listen({
    port: PORT,
    host: '0.0.0.0' 
  })
  app.log.info(`🚀 Listify API running on http://localhost:${PORT}`)
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
