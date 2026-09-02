import express from 'express'
import {
  createTask,
  deleteTask,
  findTask,
  listTasks,
  updateTaskCompletion,
} from './database.js'

const app = express()
const port = 3000
const host = '127.0.0.1'

app.use(express.json({ limit: '10kb' }))

app.get('/api/health', function (request, response) {
  response.json({
    status: 'ok',
  })
})

app.get('/api/tasks', function (request, response) {
  const tasks = listTasks()

  response.json(tasks)
})

app.get('/api/tasks/:taskId', function (request, response) {
  const task = findTask(request.params.taskId)

  if (task === null) {
    return response.status(404).json({
      error: 'Task not found.',
    })
  }

  return response.json(task)
})

app.post('/api/tasks', function (request, response) {
  const title = request.body.title

  if (typeof title !== 'string' || title.trim() === '') {
    return response.status(400).json({
      error: 'Task title is required.',
    })
  }

  const newTask = createTask(title.trim())

  return response.status(201).json(newTask)
})

app.patch('/api/tasks/:taskId', function (request, response) {
  const completed = request.body.completed

  if (typeof completed !== 'boolean') {
    return response.status(400).json({
      error: 'Completed must be true or false.',
    })
  }

  const updatedTask = updateTaskCompletion(
    request.params.taskId,
    completed,
  )

  if (updatedTask === null) {
    return response.status(404).json({
      error: 'Task not found.',
    })
  }

  return response.json(updatedTask)
})

app.delete('/api/tasks/:taskId', function (request, response) {
  const wasDeleted = deleteTask(request.params.taskId)

  if (!wasDeleted) {
    return response.status(404).json({
      error: 'Task not found.',
    })
  }

  return response.status(204).send()
})

app.use(function (request, response) {
  response.status(404).json({
    error: 'Route not found.',
  })
})

app.use(function (error, request, response, next) {
  console.error(error)

  if (error instanceof SyntaxError) {
    return response.status(400).json({
      error: 'Request body contains invalid JSON.',
    })
  }

  return response.status(500).json({
    error: 'An unexpected server error occurred.',
  })
})

app.listen(port, host, function () {
  console.log(`Task API running at http://${host}:${port}`)
})