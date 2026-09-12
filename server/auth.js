import {
  auth,
} from 'express-oauth2-jwt-bearer'

export function createAuthenticationMiddleware({
  domain,
  audience,
}) {
  if (!domain) {
    throw new Error('AUTH0_DOMAIN is required.')
  }

  if (!audience) {
    throw new Error('AUTH0_AUDIENCE is required.')
  }

  return auth({
    issuerBaseURL: `https://${domain}`,
    audience,
  })
}