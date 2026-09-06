import { createApp } from './app.js'

import {
  createTaskRepository,
} from './database.js'

import {
  loadServerConfig,
} from './config.js'

const config = loadServerConfig()

const taskRepository = createTaskRepository(
  config.databasePath,
)

const app = createApp(taskRepository, {
  allowedOrigin: config.allowedOrigin,
})

app.listen(config.port, config.host, function () {
  console.log(
    `Task API running at ` +
    `http://${config.host}:${config.port}`,
  )

  console.log(
    `Using database: ${config.databasePath}`,
  )
})