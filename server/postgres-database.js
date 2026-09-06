import pg from 'pg'

const { Pool } = pg

function convertTaskRow(row) {
  if (row === undefined) {
    return null
  }

  return {
    id: row.id,
    title: row.title,
    completed: row.completed,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
  }
}

export function createPostgresTaskRepository(
  connectionString,
) {
  const pool = new Pool({
    connectionString,
  })

  async function initialize() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY,
        title TEXT NOT NULL
          CHECK (length(trim(title)) > 0),
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL
          DEFAULT CURRENT_TIMESTAMP
      );
    `)
  }

  async function listTasks() {
    const result = await pool.query(`
      SELECT id, title, completed, created_at
      FROM tasks
      ORDER BY created_at ASC, id ASC
    `)

    return result.rows.map(convertTaskRow)
  }

  async function findTask(taskId) {
    const result = await pool.query(
      `
        SELECT id, title, completed, created_at
        FROM tasks
        WHERE id = $1
      `,
      [taskId],
    )

    return convertTaskRow(result.rows[0])
  }

  async function createTask(title) {
    const taskId = crypto.randomUUID()

    const result = await pool.query(
      `
        INSERT INTO tasks (id, title, completed)
        VALUES ($1, $2, FALSE)
        RETURNING id, title, completed, created_at
      `,
      [taskId, title],
    )

    return convertTaskRow(result.rows[0])
  }

  async function updateTaskCompletion(
    taskId,
    completed,
  ) {
    const result = await pool.query(
      `
        UPDATE tasks
        SET completed = $1
        WHERE id = $2
        RETURNING id, title, completed, created_at
      `,
      [completed, taskId],
    )

    return convertTaskRow(result.rows[0])
  }

  async function deleteTask(taskId) {
    const result = await pool.query(
      `
        DELETE FROM tasks
        WHERE id = $1
      `,
      [taskId],
    )

    return result.rowCount > 0
  }

  async function close() {
    await pool.end()
  }

  return {
    initialize,
    listTasks,
    findTask,
    createTask,
    updateTaskCompletion,
    deleteTask,
    close,
  }
}