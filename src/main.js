import './style.css'

document.querySelector('#app').innerHTML = `
  <main class="app">
    <header class="app-header">
      <p class="eyebrow">My first application</p>
      <h1>Task Tracker</h1>
      <p class="subtitle">
        Keep track of what needs to be done.
      </p>
    </header>

    <section class="task-panel">
      <form id="task-form" class="task-form">
        <label for="task-input">New task</label>

        <div class="input-row">
          <input
            id="task-input"
            name="task"
            type="text"
            placeholder="For example: Learn JavaScript"
            autocomplete="off"
          />

          <button type="submit">Add task</button>
        </div>
      </form>

      <section class="task-list-section">
        <h2>Tasks</h2>

        <ul id="task-list" class="task-list">
          <li class="empty-message">No tasks yet.</li>
        </ul>
      </section>
    </section>
  </main>
`
const tasks = []

const taskForm = document.querySelector('#task-form')
const taskInput = document.querySelector('#task-input')
const taskList = document.querySelector('#task-list')

function renderTasks() {
  taskList.innerHTML = ''

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

    const taskText = document.createElement('span')
    taskText.textContent = task.title

    listItem.appendChild(taskText)
    taskList.appendChild(listItem)
  }
}

taskForm.addEventListener('submit', function (event) {
  event.preventDefault()

  const title = taskInput.value.trim()

  if (title === '') {
    taskInput.focus()
    return
  }

  const newTask = {
    id: crypto.randomUUID(),
    title: title,
    completed: false,
  }

  tasks.push(newTask)
  renderTasks()
  taskInput.value = ''
  taskInput.focus()
})