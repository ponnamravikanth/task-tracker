import cors from 'cors'
import express from 'express'

function rejectUnauthenticatedRequest(
  request,
  response,
) {
  response.status(401).json({
    error: 'Authentication required.',
  })
}
export function createApp(
  taskRepository,
  {
    allowedOrigin = 'http://localhost:5173',
    authenticate = rejectUnauthenticatedRequest,
  } = {},
) {
  const app = express()
    app.use(
    cors({
    origin: allowedOrigin,
    }),
    )

app.use(express.json())

  app.get('/api/health', function (request, response) {
    response.json({
      status: 'ok',
    })
  })
  app.get(
  '/api/me',
  authenticate,
  function (request, response) {
    response.json({
      userId: request.auth.payload.sub,
    })
  },
)

app.use('/api/tasks', authenticate)

 app.get(
  '/api/tasks',
  async function (request, response) {
    const tasks = await taskRepository.listTasks()
    response.json(tasks)
  },)

  app.get(
    '/api/tasks/:taskId',
    async function (request, response) {
      const task = await taskRepository.findTask(
        request.params.taskId,
      )

      if (task === null) {
        return response.status(404).json({
          error: 'Task not found.',
        })
      }

      return response.json(task)
    },
  )

  app.post('/api/tasks', async function (request, response) {
    const title = request.body.title

    if (
      typeof title !== 'string' ||
      title.trim() === ''
    ) {
      return response.status(400).json({
        error: 'Task title is required.',
      })
    }

    const newTask = await taskRepository.createTask(
      title.trim(),
    )

  return response.status(201).json(newTask)
  },
)

  app.patch(
    '/api/tasks/:taskId',
    async function (request, response) {
      const completed = request.body.completed

      if (typeof completed !== 'boolean') {
        return response.status(400).json({
          error: 'Completed must be true or false.',
        })
      }

      const updatedTask =
        await taskRepository.updateTaskCompletion(
          request.params.taskId,
          completed,
        )

      if (updatedTask === null) {
        return response.status(404).json({
          error: 'Task not found.',
        })
      }

      return response.json(updatedTask)
    },
  )

  app.delete(
    '/api/tasks/:taskId',
    async function (request, response) {
      const wasDeleted = await taskRepository.deleteTask(
        request.params.taskId,
      )

      if (!wasDeleted) {
        return response.status(404).json({
          error: 'Task not found.',
        })
      }

      return response.status(204).send()
    },
  )

  app.use(function (request, response) {
    response.status(404).json({
      error: 'Route not found.',
    })
  })

  app.use(function (
    error,
    request,
    response,
    next,
  ) {
  console.error(error)
  if (error.status === 401) {
  return response.status(401).json({
    error: 'Authentication required.',
  })
}
    if (error instanceof SyntaxError) {
      return response.status(400).json({
        error: 'Request body contains invalid JSON.',
      })
    }

    return response.status(500).json({
      error: 'An unexpected server error occurred.',
    })
  })

  return app
}