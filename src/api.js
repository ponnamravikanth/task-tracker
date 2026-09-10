import {
  getAccessToken,
} from './auth.js'

const configuredApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  `${import.meta.env.BASE_URL}api`

const apiBaseUrl = configuredApiBaseUrl.replace(
  /\/+$/,
  '',
)

const tasksUrl = `${apiBaseUrl}/tasks`

async function readErrorMessage(response) {
  try {
    const data = await response.json()

    if (typeof data.error === 'string') {
      return data.error
    }
  } catch {
    // The response did not contain usable JSON.
  }

  return `Request failed with status ${response.status}.`
}

async function request(url, options = {}) {
const accessToken = await getAccessToken()
const headers = new Headers(options.headers)

headers.set(
  'Authorization',
  `Bearer ${accessToken}`,
)

const response = await fetch(url, {
  ...options,
  headers,
})

  if (!response.ok) {
    const message = await readErrorMessage(response)
    throw new Error(message)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function fetchTasks() {
  return request(tasksUrl)
}

export function createTask(title) {
  return request(tasksUrl, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      title: title,
    }),
  })
}

export function setTaskCompleted(taskId, completed) {
  return request(`${tasksUrl}/${taskId}`, {
    method: 'PATCH',

    headers: {
      'Content-Type': 'application/json',
    },

    body: JSON.stringify({
      completed: completed,
    }),
  })
}

export function deleteTask(taskId) {
  return request(`${tasksUrl}/${taskId}`, {
    method: 'DELETE',
  })
}