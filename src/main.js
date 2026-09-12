import './style.css'
import {
  initializeAuthentication,
  logIn,
  logOut,
} from './auth.js'

import {
  createTask,
  deleteTask,
  fetchTasks,
  setTaskCompleted,
} from './api.js'

import {
  countRemainingTasks,
} from './tasks.js'

document.querySelector('#app').innerHTML = `
  <main class="app">
    <header class="app-header">
      <p class="eyebrow">Track and Manage Your Tasks Application </p>
      <h1>Task Tracker</h1>
      <p class="subtitle">
        Plan your day, one task at a time.
      </p>
            <div class="auth-controls">
        <p
          id="auth-status"
          class="auth-status"
          role="status"
          aria-live="polite"
        >
          Checking sign-in...
        </p>

        <button
          id="login-button"
          type="button"
          hidden
        >
          Log in
        </button>

        <button
          id="logout-button"
          type="button"
          class="secondary-button"
          hidden
        >
          Log out
        </button>
      </div>
    </header>

    <section id="task-panel" class="task-panel" hidden>
      <form id="task-form" class="task-form">
        <label for="task-input">New task</label>

        <div class="input-row">
          <input
            id="task-input"
            name="task"
            type="text"
            placeholder="For example: Learn JavaScript"
            autocomplete="off"
            maxlength="200"
          />

          <button type="submit">Add task</button>
        </div>
      </form>

      <p
        id="app-status"
        class="app-status"
        role="status"
        aria-live="polite"
      ></p>

      <section class="task-list-section">
        <div class="task-list-heading">
          <h2>Tasks</h2>
          <span id="task-count" class="task-count">
            0 tasks remaining
          </span>
        </div>

        <ul id="task-list" class="task-list"></ul>
      </section>
    </section>
  </main>
`

let tasks = []

const taskForm = document.querySelector('#task-form')
const taskInput = document.querySelector('#task-input')
const taskList = document.querySelector('#task-list')
const taskCount = document.querySelector('#task-count')
const appStatus = document.querySelector('#app-status')
const addButton = taskForm.querySelector('button[type="submit"]')
const taskPanel = document.querySelector('#task-panel')
const authStatus = document.querySelector('#auth-status')
const loginButton = document.querySelector('#login-button')
const logoutButton = document.querySelector('#logout-button')

function setStatus(message, type = '') {
  appStatus.textContent = message
  appStatus.className = 'app-status'

  if (type !== '') {
    appStatus.classList.add(`app-status-${type}`)
  }
}

function renderTasks() {
  taskList.innerHTML = ''

  const remainingCount = countRemainingTasks(tasks)
  const taskWord = remainingCount === 1 ? 'task' : 'tasks'

  taskCount.textContent =
    `${remainingCount} ${taskWord} remaining`

  if (tasks.length === 0) {
    const emptyMessage = document.createElement('li')
    emptyMessage.className = 'empty-message'
    emptyMessage.textContent = 'No tasks yet.'

    taskList.appendChild(emptyMessage)
    return
  }

  for (const task of tasks) {
    const listItem = document.createElement('li')
    listItem.className = 'task-item'

    const taskLabel = document.createElement('label')
    taskLabel.className = 'task-check'

    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = task.completed

    const taskText = document.createElement('span')
    taskText.className = 'task-text'
    taskText.textContent = task.title

    if (task.completed) {
      taskText.classList.add('completed')
    }

    checkbox.addEventListener('change', async function () {
      checkbox.disabled = true
      setStatus('Saving task...')

      try {
        const updatedTask = await setTaskCompleted(
          task.id,
          checkbox.checked,
        )

        tasks = tasks.map(function (currentTask) {
          if (currentTask.id === updatedTask.id) {
            return updatedTask
          }

          return currentTask
        })

        renderTasks()
        setStatus('')
      } catch (error) {
        renderTasks()
        setStatus(error.message, 'error')
      }
    })

    const deleteButton = document.createElement('button')
    deleteButton.type = 'button'
    deleteButton.className = 'delete-button'
    deleteButton.textContent = 'Delete'
    deleteButton.setAttribute(
      'aria-label',
      `Delete ${task.title}`,
    )

    deleteButton.addEventListener('click', async function () {
      deleteButton.disabled = true
      setStatus('Deleting task...')

      try {
        await deleteTask(task.id)

        tasks = tasks.filter(function (currentTask) {
          return currentTask.id !== task.id
        })

        renderTasks()
        setStatus('')
      } catch (error) {
        deleteButton.disabled = false
        setStatus(error.message, 'error')
      }
    })

    taskLabel.appendChild(checkbox)
    taskLabel.appendChild(taskText)

    listItem.appendChild(taskLabel)
    listItem.appendChild(deleteButton)

    taskList.appendChild(listItem)
  }
}

async function loadTasks() {
  setStatus('Loading tasks...')

  try {
    tasks = await fetchTasks()

    renderTasks()
    setStatus('')
  } catch (error) {
    renderTasks()
    setStatus(error.message, 'error')
  }
}

taskForm.addEventListener('submit', async function (event) {
  event.preventDefault()

  const title = taskInput.value.trim()

  if (title === '') {
    taskInput.focus()
    return
  }

  addButton.disabled = true
  setStatus('Adding task...')

  try {
    const newTask = await createTask(title)

    tasks = [...tasks, newTask]

    renderTasks()

    taskInput.value = ''
    taskInput.focus()
    setStatus('')
  } catch (error) {
    setStatus(error.message, 'error')
  } finally {
    addButton.disabled = false
  }
})
loginButton.addEventListener('click', async function () {
  loginButton.disabled = true
  authStatus.textContent = 'Opening login...'

  try {
    await logIn()
  } catch (error) {
    loginButton.disabled = false
    authStatus.textContent = error.message
  }
})

logoutButton.addEventListener('click', function () {
  logOut()
})
async function initializeApplication() {
  taskPanel.hidden = true
  loginButton.hidden = true
  logoutButton.hidden = true
  authStatus.textContent = 'Checking sign-in...'

  try {
    const authentication =
      await initializeAuthentication()

    if (!authentication.authenticated) {
      authStatus.textContent =
        'Log in to view your tasks.'

      loginButton.hidden = false
      return
    }

    const displayName =
      authentication.user?.name ||
      authentication.user?.email ||
      'Signed-in user'

    authStatus.textContent =
      `Signed in as ${displayName}`

    logoutButton.hidden = false
    taskPanel.hidden = false

    await loadTasks()
  } catch (error) {
    authStatus.textContent =
      `Authentication error: ${error.message}`

    loginButton.hidden = false
  }
}

initializeApplication()