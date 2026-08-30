export function addTask(tasks, title, id = crypto.randomUUID()) {
  const cleanTitle = title.trim()

  if (cleanTitle === '') {
    return tasks
  }

  const newTask = {
    id: id,
    title: cleanTitle,
    completed: false,
  }

  return [...tasks, newTask]
}

export function setTaskCompleted(tasks, taskId, completed) {
  return tasks.map(function (task) {
    if (task.id !== taskId) {
      return task
    }

    return {
      ...task,
      completed: completed,
    }
  })
}

export function deleteTask(tasks, taskId) {
  return tasks.filter(function (task) {
    return task.id !== taskId
  })
}