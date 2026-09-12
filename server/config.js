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
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL environment variable is required.',
    )
  }
const auth0Domain = process.env.AUTH0_DOMAIN
const auth0Audience = process.env.AUTH0_AUDIENCE
if (!auth0Domain) {
  throw new Error(
    'AUTH0_DOMAIN environment variable is required.',
  )
}

if (!auth0Audience) {
  throw new Error(
    'AUTH0_AUDIENCE environment variable is required.',
  )
}
  return {
  host: process.env.HOST || '127.0.0.1',
  port: parsePort(process.env.PORT),
  databaseUrl,
  auth0Domain,
  auth0Audience,
  allowedOrigin:
    process.env.CORS_ORIGIN ||
    'http://localhost:5173',
}

}