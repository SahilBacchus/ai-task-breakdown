'use client'

import { KanbanBoard } from '@/components/kanban-board'
import { ListView } from '@/components/list-view'
import { Task } from '@/lib/types'
import { LayoutGrid, List } from 'lucide-react'
import { useState } from 'react'

type ViewMode = 'kanban' | 'list'

export default function KanbanPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Design homepage', status: 'todo', priority: 'high', description: 'Create wireframes for homepage', estimatedTime: '2h', createdAt: new Date() },
    { id: '2', title: 'Set up database', status: 'in-progress', priority: 'medium', description: 'Configure PostgreSQL', estimatedTime: '3h', createdAt: new Date() },
    { id: '3', title: 'Deploy Vercel app', status: 'done', priority: 'low', description: 'Push latest build to Vercel', estimatedTime: '30m', createdAt: new Date() },
    { id: '4', title: 'Write documentation', status: 'todo', priority: 'medium', description: 'Add API docs', estimatedTime: '1h', createdAt: new Date() },
  ])

  const handleTaskUpdate = (updatedTasks: Task[]) => setTasks(updatedTasks)
  const handleTaskDelete = (taskId: string) => setTasks(tasks.filter(t => t.id !== taskId))

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ textAlign: 'center', margin: 0 }}>Kanban Board Demo</h1>

        {/* View toggle */}
        <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
          <button
            onClick={() => setViewMode('kanban')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500,
              background: viewMode === 'kanban' ? '#f3f4f6' : 'white',
              color: viewMode === 'kanban' ? '#111827' : '#6b7280',
            }}
          >
            <LayoutGrid size={15} /> Kanban
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', border: 'none', borderLeft: '1px solid #e5e7eb', cursor: 'pointer',
              fontSize: '13px', fontWeight: 500,
              background: viewMode === 'list' ? '#f3f4f6' : 'white',
              color: viewMode === 'list' ? '#111827' : '#6b7280',
            }}
          >
            <List size={15} /> List
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
      ) : (
        <ListView
          tasks={tasks}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
      )}
    </div>
  )
}