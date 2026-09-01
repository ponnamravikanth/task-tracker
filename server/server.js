import express from 'express'

const app = express()
const port = 3000
const host = '127.0.0.1'

let tasks = []

app.use(express.json({ limit: '10kb' }))

app.get('/api/health', function (request, response) {
  response.json({
    status: 'ok',
  })
})

app.get('/api/tasks', function (request, response) {
  response.json(tasks)
})

app.post('/api/tasks', function (request, response) {
  const title = request.body.title

  if (typeof title !== 'string' || title.trim() === '') {
    return response.status(400).json({
      error: 'Task title is required.',
    })
  }

  const newTask = {
    id: crypto.randomUUID(),
    title: title.trim(),
    completed: false,
  }

  tasks.push(newTask)

  return response.status(201).json(newTask)
})

app.patch('/api/tasks/:taskId', function (request, response) {
  const task = tasks.find(function (currentTask) {
    return currentTask.id === request.params.taskId
  })

  if (task === undefined) {
    return response.status(404).json({
      error: 'Task not found.',
    })
  }

  const completed = request.body.completed

  if (typeof completed !== 'boolean') {
    return response.status(400).json({
      error: 'Completed must be true or false.',
    })
  }

  task.completed = completed

  return response.json(task)
})

app.delete('/api/tasks/:taskId', function (request, response) {
  const taskIndex = tasks.findIndex(function (task) {
    return task.id === request.params.taskId
  })

  if (taskIndex === -1) {
    return response.status(404).json({
      error: 'Task not found.',
    })
  }

  tasks.splice(taskIndex, 1)

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