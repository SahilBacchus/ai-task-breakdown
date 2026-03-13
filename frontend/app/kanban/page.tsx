'use client'

import { useState } from 'react'
import { KanbanBoard } from '@/components/kanban-board'
import { Task } from '@/lib/types'

export default function KanbanPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Design homepage', status: 'todo', priority: 'high', description: 'Create wireframes for homepage', estimatedTime: '2h', createdAt: new Date() },
    { id: '2', title: 'Set up database', status: 'in-progress', priority: 'medium', description: 'Configure PostgreSQL', estimatedTime: '3h', createdAt: new Date() },
    { id: '3', title: 'Deploy Vercel app', status: 'done', priority: 'low', description: 'Push latest build to Vercel', estimatedTime: '30m', createdAt: new Date()},
    { id: '4', title: 'Write documentation', status: 'todo', priority: 'medium', description: 'Add API docs', estimatedTime: '1h',  createdAt: new Date() },
  ])

  const handleTaskUpdate = (updatedTasks: Task[]) => setTasks(updatedTasks)
  const handleTaskDelete = (taskId: string) => setTasks(tasks.filter(t => t.id !== taskId))

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Kanban Board Demo</h1>
      <KanbanBoard
        tasks={tasks}
        onTaskUpdate={handleTaskUpdate}
        onTaskDelete={handleTaskDelete}
      />
    </div>
  )
}