import { describe, expect, it } from 'vitest'
import {
  addTask,
  deleteTask,
  setTaskCompleted,
} from './tasks.js'

describe('addTask', function () {
  it('adds a new incomplete task', function () {
    const startingTasks = []

    const result = addTask(
      startingTasks,
      'Learn JavaScript',
      'task-123',
    )

    expect(result).toEqual([
      {
        id: 'task-123',
        title: 'Learn JavaScript',
        completed: false,
      },
    ])
  })

  it('removes surrounding spaces from the title', function () {
    const result = addTask(
      [],
      '   Learn Git   ',
      'task-123',
    )

    expect(result[0].title).toBe('Learn Git')
  })

  it('does not add an empty task', function () {
    const startingTasks = []

    const result = addTask(startingTasks, '   ', 'task-123')

    expect(result).toEqual([])
  })
})

describe('setTaskCompleted', function () {
  it('marks the selected task complete', function () {
    const startingTasks = [
      {
        id: 'task-1',
        title: 'First task',
        completed: false,
      },
      {
        id: 'task-2',
        title: 'Second task',
        completed: false,
      },
    ]

    const result = setTaskCompleted(
      startingTasks,
      'task-2',
      true,
    )

    expect(result[0].completed).toBe(false)
    expect(result[1].completed).toBe(true)
  })
})

describe('deleteTask', function () {
  it('deletes only the selected task', function () {
    const startingTasks = [
      {
        id: 'task-1',
        title: 'First task',
        completed: false,
      },
      {
        id: 'task-2',
        title: 'Second task',
        completed: false,
      },
    ]

    const result = deleteTask(startingTasks, 'task-1')

    expect(result).toEqual([
      {
        id: 'task-2',
        title: 'Second task',
        completed: false,
      },
    ])
  })
})