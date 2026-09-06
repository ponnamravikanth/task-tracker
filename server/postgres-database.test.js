import pg from 'pg'

import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import {
  createPostgresTaskRepository,
} from './postgres-database.js'

const { Pool } = pg

const databaseUrl = process.env.TEST_DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'TEST_DATABASE_URL environment variable is required.',
  )
}

const databaseName = new URL(
  databaseUrl,
).pathname.replace(/^\//, '')

if (databaseName !== 'task_tracker_test') {
  throw new Error(
    'PostgreSQL integration tests must use ' +
      'the task_tracker_test database.',
  )
}

const repository =
  createPostgresTaskRepository(databaseUrl)

const cleanupPool = new Pool({
  connectionString: databaseUrl,
})

beforeAll(async function () {
  await repository.initialize()
})

beforeEach(async function () {
  await cleanupPool.query('TRUNCATE TABLE tasks')
})

afterAll(async function () {
  await cleanupPool.end()
  await repository.close()
})

describe('PostgreSQL task repository', function () {
  it('starts with no tasks', async function () {
    const tasks = await repository.listTasks()

    expect(tasks).toEqual([])
  })

  it('creates, finds, and lists a task', async function () {
    const createdTask =
      await repository.createTask(
        'Test PostgreSQL repository',
      )

    expect(createdTask).toMatchObject({
      title: 'Test PostgreSQL repository',
      completed: false,
    })

    expect(createdTask.id).toEqual(
      expect.any(String),
    )

    expect(createdTask.createdAt).toEqual(
      expect.any(String),
    )

    const foundTask =
      await repository.findTask(createdTask.id)

    expect(foundTask).toEqual(createdTask)

    const tasks = await repository.listTasks()

    expect(tasks).toEqual([createdTask])
  })

  it('updates task completion', async function () {
    const createdTask =
      await repository.createTask(
        'Complete integration test',
      )

    const updatedTask =
      await repository.updateTaskCompletion(
        createdTask.id,
        true,
      )

    expect(updatedTask).toEqual({
      ...createdTask,
      completed: true,
    })
  })

  it('returns null for a missing task', async function () {
    const missingTask =
      await repository.findTask(
        '00000000-0000-0000-0000-000000000000',
      )

    expect(missingTask).toBeNull()
  })

  it('deletes a task', async function () {
    const createdTask =
      await repository.createTask(
        'Delete integration test task',
      )

    const wasDeleted =
      await repository.deleteTask(createdTask.id)

    expect(wasDeleted).toBe(true)

    const deletedTask =
      await repository.findTask(createdTask.id)

    expect(deletedTask).toBeNull()
  })

  it('reports false when deleting a missing task', async function () {
    const wasDeleted =
      await repository.deleteTask(
        '00000000-0000-0000-0000-000000000000',
      )

    expect(wasDeleted).toBe(false)
  })
})