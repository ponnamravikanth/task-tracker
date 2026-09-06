import { createApp } from './app.js'
import { loadServerConfig } from './config.js'

import {
  createPostgresTaskRepository,
} from './postgres-database.js'

const config = loadServerConfig()

const taskRepository =
  createPostgresTaskRepository(config.databaseUrl)

await taskRepository.initialize()

const app = createApp(taskRepository, {
  allowedOrigin: config.allowedOrigin,
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