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
        user_id TEXT,
        title TEXT NOT NULL
          CHECK (length(trim(title)) > 0),
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL
          DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS user_id TEXT;

      CREATE INDEX IF NOT EXISTS tasks_user_id_idx
      ON tasks (user_id);
    `)
  }

  async function listTasks(userId) {
    const result = await pool.query(
      `
        SELECT id, title, completed, created_at
        FROM tasks
        WHERE user_id = $1
        ORDER BY created_at ASC, id ASC
      `,
      [userId],
    )

    return result.rows.map(convertTaskRow)
  }

  async function findTask(userId, taskId) {
    const result = await pool.query(
      `
        SELECT id, title, completed, created_at
        FROM tasks
        WHERE id = $1
          AND user_id = $2
      `,
      [taskId, userId],
    )

    return convertTaskRow(result.rows[0])
  }

  async function createTask(userId, title) {
    const taskId = crypto.randomUUID()

    const result = await pool.query(
      `
        INSERT INTO tasks (
          id,
          user_id,
          title,
          completed
        )
        VALUES ($1, $2, $3, FALSE)
        RETURNING id, title, completed, created_at
      `,
      [taskId, userId, title],
    )

    return convertTaskRow(result.rows[0])
  }

  async function updateTaskCompletion(
    userId,
    taskId,
    completed,
  ) {
    const result = await pool.query(
      `
        UPDATE tasks
        SET completed = $1
        WHERE id = $2
          AND user_id = $3
        RETURNING id, title, completed, created_at
      `,
      [completed, taskId, userId],
    )

    return convertTaskRow(result.rows[0])
  }

  async function deleteTask(userId, taskId) {
    const result = await pool.query(
      `
        DELETE FROM tasks
        WHERE id = $1
          AND user_id = $2
      `,
      [taskId, userId],
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