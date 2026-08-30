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
console.log('Task Tracker loaded')