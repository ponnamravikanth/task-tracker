import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import { createApp } from './app.js'

import {
  createTaskRepository,
} from './database.js'

let repository
let server
let baseUrl
function authenticateTestUser(
  request,
  response,
  next,
) {
  request.auth = {
    payload: {
      sub: 'auth0|test-user',
    },
  }

  next()
}

beforeEach(async function () {
  repository = createTaskRepository(':memory:')

  const app = createApp(repository, {
  authenticate: authenticateTestUser,
})

  server = app.listen(0, '127.0.0.1')

  await new Promise(function (resolve, reject) {
    server.once('listening', resolve)
    server.once('error', reject)
  })

  const address = server.address()

  baseUrl = `http://127.0.0.1:${address.port}`
})

afterEach(async function () {
  await new Promise(function (resolve, reject) {
    server.close(function (error) {
      if (error) {
        reject(error)
        return
      }

      resolve()
    })
  })

  await repository.close()
})

async function createTask(title) {
  return fetch(`${baseUrl}/api/tasks`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      title: title,
    }),
  })
}

describe('task API', function () {
  it('reports that the API is healthy', async function () {
    const response = await fetch(
      `${baseUrl}/api/health`,
    )

    expect(response.status).toBe(200)

    expect(await response.json()).toEqual({
      status: 'ok',
    })
  })

  it('creates and retrieves a task', async function () {
    const createResponse = await createTask(
      'Learn API testing',
    )

    expect(createResponse.status).toBe(201)

    const createdTask = await createResponse.json()

    expect(createdTask).toMatchObject({
      title: 'Learn API testing',
      completed: false,
    })

    expect(createdTask.id).toEqual(expect.any(String))
    expect(createdTask.createdAt).toEqual(
      expect.any(String),
    )

    const listResponse = await fetch(
      `${baseUrl}/api/tasks`,
    )

    expect(listResponse.status).toBe(200)

    expect(await listResponse.json()).toEqual([
      createdTask,
    ])
  })

  it('rejects an empty task title', async function () {
    const response = await createTask('   ')

    expect(response.status).toBe(400)

    expect(await response.json()).toEqual({
      error: 'Task title is required.',
    })
  })

  it('updates a task completion status', async function () {
    const createResponse = await createTask(
      'Complete this task',
    )

    const createdTask = await createResponse.json()

    const updateResponse = await fetch(
      `${baseUrl}/api/tasks/${createdTask.id}`,
      {
        method: 'PATCH',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          completed: true,
        }),
      },
    )

    expect(updateResponse.status).toBe(200)

    expect(await updateResponse.json()).toMatchObject({
      id: createdTask.id,
      title: 'Complete this task',
      completed: true,
    })
  })

  it('deletes a task', async function () {
    const createResponse = await createTask(
      'Delete this task',
    )

    const createdTask = await createResponse.json()

    const deleteResponse = await fetch(
      `${baseUrl}/api/tasks/${createdTask.id}`,
      {
        method: 'DELETE',
      },
    )

    expect(deleteResponse.status).toBe(204)

    const listResponse = await fetch(
      `${baseUrl}/api/tasks`,
    )

    expect(await listResponse.json()).toEqual([])
  })

  it('returns 404 for a missing task', async function () {
    const response = await fetch(
      `${baseUrl}/api/tasks/does-not-exist`,
    )

    expect(response.status).toBe(404)

    expect(await response.json()).toEqual({
      error: 'Task not found.',
    })
  })
})