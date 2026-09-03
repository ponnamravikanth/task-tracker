import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const currentFile = fileURLToPath(import.meta.url)
const currentDirectory = dirname(currentFile)

export const defaultDatabasePath = resolve(
  currentDirectory,
  '../data/task-tracker.db',
)

function convertTaskRow(row) {
  if (row === undefined) {
    return null
  }

  return {
    id: row.id,
    title: row.title,
    completed: Boolean(row.completed),
    createdAt: row.created_at,
  }
}

export function createTaskRepository(
  databasePath = defaultDatabasePath,
) {
  if (databasePath !== ':memory:') {
    mkdirSync(dirname(databasePath), {
      recursive: true,
    })
  }

  const database = new DatabaseSync(databasePath, {
    timeout: 5000,
  })

  database.exec(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL
        CHECK (length(trim(title)) > 0),
      completed INTEGER NOT NULL DEFAULT 0
        CHECK (completed IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
  `)

  function listTasks() {
    const statement = database.prepare(`
      SELECT id, title, completed, created_at
      FROM tasks
      ORDER BY created_at ASC, rowid ASC
    `)

    return statement.all().map(convertTaskRow)
  }

  function findTask(taskId) {
    const statement = database.prepare(`
      SELECT id, title, completed, created_at
      FROM tasks
      WHERE id = ?
    `)

    return convertTaskRow(statement.get(taskId))
  }

  function createTask(title) {
    const taskId = crypto.randomUUID()

    const statement = database.prepare(`
      INSERT INTO tasks (id, title, completed)
      VALUES (?, ?, 0)
    `)

    statement.run(taskId, title)

    return findTask(taskId)
  }

  function updateTaskCompletion(taskId, completed) {
    const statement = database.prepare(`
      UPDATE tasks
      SET completed = ?
      WHERE id = ?
    `)

    const result = statement.run(
      completed ? 1 : 0,
      taskId,
    )

    if (Number(result.changes) === 0) {
      return null
    }

    return findTask(taskId)
  }

  function deleteTask(taskId) {
    const statement = database.prepare(`
      DELETE FROM tasks
      WHERE id = ?
    `)

    const result = statement.run(taskId)

    return Number(result.changes) > 0
  }

  function close() {
    database.close()
  }

  return {
    listTasks,
    findTask,
    createTask,
    updateTaskCompletion,
    deleteTask,
    close,
  }
}