import { createApp } from './app.js'
import { loadServerConfig } from './config.js'

import {
  createPostgresTaskRepository,
} from './postgres-database.js'
import {
  createAuthenticationMiddleware,
} from './auth.js'

const config = loadServerConfig()
const authenticate =
  createAuthenticationMiddleware({
    domain: config.auth0Domain,
    audience: config.auth0Audience,
  })

const taskRepository =
  createPostgresTaskRepository(config.databaseUrl)

await taskRepository.initialize()

const app = createApp(taskRepository, {
  allowedOrigin: config.allowedOrigin,
  authenticate,
})

const server = app.listen(
  config.port,
  config.host,
  function () {
    console.log(
      `Task API running at ` +
        `http://${config.host}:${config.port}`,
    )

    console.log('Using PostgreSQL database')
  },
)

async function shutDown() {
  console.log('Shutting down server...')

  server.close(async function () {
    await taskRepository.close()
    process.exit(0)
  })
}

process.on('SIGINT', shutDown)
process.on('SIGTERM', shutDown)