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
      user_id TEXT,
      title TEXT NOT NULL
        CHECK (length(trim(title)) > 0),
      completed INTEGER NOT NULL DEFAULT 0
        CHECK (completed IN (0, 1)),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) STRICT;
  `)
  const taskColumns = database
  .prepare('PRAGMA table_info(tasks)')
  .all()

const hasUserIdColumn = taskColumns.some(
  function (column) {
    return column.name === 'user_id'
  },
)

if (!hasUserIdColumn) {
  database.exec(`
    ALTER TABLE tasks
    ADD COLUMN user_id TEXT;
  `)
}

database.exec(`
  CREATE INDEX IF NOT EXISTS tasks_user_id_idx
  ON tasks (user_id);
`)

  function listTasks(userId) {
  const statement = database.prepare(`
    SELECT id, title, completed, created_at
    FROM tasks
    WHERE user_id = ?
    ORDER BY created_at ASC, rowid ASC
  `)

  return statement.all(userId).map(convertTaskRow)
}

  function findTask(userId, taskId) {
  const statement = database.prepare(`
    SELECT id, title, completed, created_at
    FROM tasks
    WHERE id = ?
      AND user_id = ?
  `)

  return convertTaskRow(
    statement.get(taskId, userId),
  )
}

  function createTask(userId, title) {
  const taskId = crypto.randomUUID()

  const statement = database.prepare(`
    INSERT INTO tasks (
      id,
      user_id,
      title,
      completed
    )
    VALUES (?, ?, ?, 0)
  `)

  statement.run(taskId, userId, title)

  return findTask(userId, taskId)
}

  function updateTaskCompletion(
  userId,
  taskId,
  completed,
) {
  const statement = database.prepare(`
    UPDATE tasks
    SET completed = ?
    WHERE id = ?
      AND user_id = ?
  `)

  const result = statement.run(
    completed ? 1 : 0,
    taskId,
    userId,
  )

  if (Number(result.changes) === 0) {
    return null
  }

  return findTask(userId, taskId)
}

 function deleteTask(userId, taskId) {
  const statement = database.prepare(`
    DELETE FROM tasks
    WHERE id = ?
      AND user_id = ?
  `)

  const result = statement.run(taskId, userId)

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