import { createApp } from './app.js'

import {
  createTaskRepository,
  defaultDatabasePath,
} from './database.js'

const port = 3000
const host = '127.0.0.1'

const taskRepository = createTaskRepository(
  defaultDatabasePath,
)

const app = createApp(taskRepository)

app.listen(port, host, function () {
  console.log(`Task API running at http://${host}:${port}`)
})