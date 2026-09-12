import cors from 'cors'
import express from 'express'
import helmet from 'helmet'

const maximumTaskTitleLength = 200

const taskIdPattern =
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i

function rejectUnauthenticatedRequest(
  request,
  response,
) {
  response.status(401).json({
    error: 'Authentication required.',
  })
}

function getUserId(request) {
  return request.auth.payload.sub
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
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    strictTransportSecurity: false,
  }),
)
  app.use(
    cors({
      origin: allowedOrigin,
    }),
  )

  app.use(
  express.json({
    limit: '10kb',
  }),
)

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
        userId: getUserId(request),
      })
    },
  )

  app.use('/api/tasks', authenticate)
  app.param(
  'taskId',
  function (request, response, next, taskId) {
    if (!taskIdPattern.test(taskId)) {
      return response.status(400).json({
        error: 'Task ID is invalid.',
      })
    }

    return next()
  },
)

  app.get(
    '/api/tasks',
    async function (request, response) {
      const tasks = await taskRepository.listTasks(
        getUserId(request),
      )

      response.json(tasks)
    },
  )

  app.get(
    '/api/tasks/:taskId',
    async function (request, response) {
      const task = await taskRepository.findTask(
        getUserId(request),
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

  app.post(
    '/api/tasks',
    async function (request, response) {
      const title = request.body.title
      const normalizedTitle =
        typeof title === 'string'
       ? title.trim()
        : ''
      if (normalizedTitle === '') {
          return response.status(400).json({
          error: 'Task title is required.',
          })
      }

      if (
          normalizedTitle.length >
          maximumTaskTitleLength
        ) {
            return response.status(400).json({
            error:
              `Task title must be ${maximumTaskTitleLength} ` +
              `characters or fewer.`,
            })
          }

      const newTask = await taskRepository.createTask(
        getUserId(request),
        normalizedTitle,
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
          getUserId(request),
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
      const wasDeleted =
        await taskRepository.deleteTask(
          getUserId(request),
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

  app.use(function (error,request,response, next,) 
  {
    console.error(error)

    if (error.status === 401) 
    {
      return response.status(401).json({error: 'Authentication required.',})
    }
    if (error.type === 'entity.too.large') 
    {
        return response.status(413).json({ error: 'Request body is too large.',})
    }
    if (error instanceof SyntaxError) 
    {
      return response.status(400).json({ error: 'Request body contains invalid JSON.',})
    }

    return response.status(500).json({error: 'An unexpected server error occurred.',})
  })

  return app
}