import {
  createAuth0Client,
} from '@auth0/auth0-spa-js'

const domain = import.meta.env.VITE_AUTH0_DOMAIN
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
const audience = import.meta.env.VITE_AUTH0_AUDIENCE

let authClient

function getApplicationUrl() {
  return new URL(
    import.meta.env.BASE_URL,
    window.location.origin,
  ).toString()
}

function validateConfiguration() {
  const missingSettings = []

  if (!domain) {
    missingSettings.push('VITE_AUTH0_DOMAIN')
  }

  if (!clientId) {
    missingSettings.push('VITE_AUTH0_CLIENT_ID')
  }

  if (!audience) {
    missingSettings.push('VITE_AUTH0_AUDIENCE')
  }

  if (missingSettings.length > 0) {
    throw new Error(
      `Missing authentication configuration: ` +
        missingSettings.join(', '),
    )
  }
}

export async function initializeAuthentication() {
  validateConfiguration()

  authClient = await createAuth0Client({
    domain,
    clientId,

    authorizationParams: {
      audience,
      redirect_uri: getApplicationUrl(),
    },
  })

  const query = window.location.search

  if (
    query.includes('code=') &&
    query.includes('state=')
  ) {
    await authClient.handleRedirectCallback()

    window.history.replaceState(
      {},
      document.title,
      getApplicationUrl(),
    )
  }

  const authenticated =
    await authClient.isAuthenticated()

  const user = authenticated
    ? await authClient.getUser()
    : null

  return {
    authenticated,
    user,
  }
}

export async function logIn() {
  await authClient.loginWithRedirect()
}

export function logOut() {
  authClient.logout({
    logoutParams: {
      returnTo: getApplicationUrl(),
    },
  })
}

export async function getAccessToken() {
  return authClient.getTokenSilently()
}