import {
  defaultDatabasePath,
} from './database.js'

function parsePort(value) {
  const port = Number.parseInt(value ?? '3000', 10)

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error(
      'PORT must be an integer between 1 and 65535.',
    )
  }

  return port
}

export function loadServerConfig() {
  const port = Number(process.env.PORT || 3000)

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535')
  }

  return {
    host: process.env.HOST || '127.0.0.1',
    port,
    databasePath:
      process.env.DATABASE_PATH || './data/task-tracker.db',
    allowedOrigin:
      process.env.CORS_ORIGIN || 'http://localhost:5173',
  }
}