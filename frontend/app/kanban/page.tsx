'use client'

import { KanbanBoard } from '@/components/kanban-board'
import { ListView } from '@/components/list-view'
import { ChatInterface } from '@/components/chat-interface'
import { Task, ChatMessage } from '@/lib/types'
import { LayoutGrid, List, MessageSquare, X } from 'lucide-react'
import { useState } from 'react'

type ViewMode = 'kanban' | 'list'

export default function KanbanPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban')
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Design homepage', status: 'todo', priority: 'high', description: 'Create wireframes for homepage', estimatedTime: '2h', createdAt: new Date() },
    { id: '2', title: 'Set up database', status: 'in-progress', priority: 'medium', description: 'Configure PostgreSQL', estimatedTime: '3h', createdAt: new Date() },
    { id: '3', title: 'Deploy Vercel app', status: 'done', priority: 'low', description: 'Push latest build to Vercel', estimatedTime: '30m', createdAt: new Date() },
    { id: '4', title: 'Write documentation', status: 'todo', priority: 'medium', description: 'Add API docs', estimatedTime: '1h', createdAt: new Date() },
  ])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const handleTaskUpdate = (updatedTasks: Task[]) => setTasks(updatedTasks)
  const handleTaskDelete = (taskId: string) => setTasks(tasks.filter(t => t.id !== taskId))

  return (
    <div style={{ padding: '2rem', position: 'relative', minHeight: '100vh' }}>
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

        {/* Chat toggle button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 500,
            background: isChatOpen ? '#f3f4f6' : 'white',
            color: isChatOpen ? '#111827' : '#6b7280',
            marginLeft: '8px',
          }}
        >
          {isChatOpen ? <X size={15} /> : <MessageSquare size={15} />}
          {isChatOpen ? 'Close Chat' : 'Task Assistant'}
        </button>
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '2rem',
        position: 'relative',
      }}>
        {/* Main content */}
        <div style={{ 
          flex: isChatOpen ? '0 0 calc(50% - 1rem)' : '1',
          transition: 'flex 0.3s ease',
        }}>
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

        {/* Chat interface */}
        {isChatOpen && (
          <div style={{
            flex: '0 0 calc(50% - 1rem)',
            maxWidth: '500px',
            height: 'calc(100vh - 200px)',
            position: 'sticky',
            top: '2rem',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: '1px solid #e5e7eb',
          }}>
          <ChatInterface
            messages={chatMessages}
            tasks={activeProject.tasks || []}
            projectId={activeProjectId}   // <-- add this
            onMessagesUpdate={setChatMessages}
            onTasksUpdate={handleTaskUpdate}
            onClose={() => setIsChatOpen(false)}
          />
          </div>
        )}
      </div>

      {/* Mobile-friendly floating chat button */}
      <style jsx>{`
        @media (max-width: 768px) {
          div[style*="display: flex"][style*="gap: 2rem"] {
            flex-direction: column;
          }
          
          div[style*="flex: 0 0 calc(50% - 1rem)"] {
            max-width: 100%;
            height: 500px;
            position: fixed;
            bottom: 1rem;
            left: 1rem;
            right: 1rem;
            top: auto;
            z-index: 50;
          }
        }
      `}</style>
    </div>
  )
}