'use client'

import { useState } from 'react'
import { Task, TaskStatus } from '@/lib/types'
import { TaskCard } from '@/components/task-card'
import { Circle, Timer, CheckCircle2 } from 'lucide-react'
import styles from './kanban-board.module.css'

interface KanbanBoardProps {
  tasks: Task[]
  onTaskUpdate: (tasks: Task[]) => void
  onTaskDelete: (taskId: string) => void
}

interface KanbanColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  onDrop: (taskId: string, newStatus: TaskStatus) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
  icon: React.ReactNode
  iconWrapperClass: string
}

function KanbanColumn({
  title,
  status,
  tasks,
  onDrop,
  onStatusChange,
  onDelete,
  icon,
  iconWrapperClass,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      onDrop(taskId, status)
    }
  }

  return (
    <div
      className={`${styles.column} ${isDragOver ? styles.columnDragOver : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={styles.columnHeader}>
        <div className={`${styles.columnIconWrapper} ${iconWrapperClass}`}>
          {icon}
        </div>
        <h3 className={styles.columnTitle}>{title}</h3>
        <span className={styles.columnCount}>{tasks.length}</span>
      </div>

      <div className={styles.columnContent}>
        <div className={styles.taskList}>
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
          {tasks.length === 0 && (
            <div className={styles.emptyColumn}>No tasks</div>
          )}
        </div>
      </div>
    </div>
  )
}

interface DraggableTaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
}

function DraggableTaskCard({
  task,
  onStatusChange,
  onDelete,
}: DraggableTaskCardProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id)
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      className={styles.draggableCard}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TaskCard
        task={task}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        isDragging={isDragging}
      />
    </div>
  )
}

export function KanbanBoard({
  tasks,
  onTaskUpdate,
  onTaskDelete,
}: KanbanBoardProps) {
  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  const handleDrop = (taskId: string, newStatus: TaskStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    )
    onTaskUpdate(updatedTasks)
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, status } : task
    )
    onTaskUpdate(updatedTasks)
  }

  const columns = [
    {
      title: 'To Do',
      status: 'todo' as TaskStatus,
      tasks: todoTasks,
      icon: <Circle className={styles.columnIcon} />,
      iconWrapperClass: styles.columnIconTodo,
    },
    {
      title: 'In Progress',
      status: 'in-progress' as TaskStatus,
      tasks: inProgressTasks,
      icon: <Timer className={styles.columnIcon} />,
      iconWrapperClass: styles.columnIconInProgress,
    },
    {
      title: 'Done',
      status: 'done' as TaskStatus,
      tasks: doneTasks,
      icon: <CheckCircle2 className={styles.columnIcon} />,
      iconWrapperClass: styles.columnIconDone,
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {columns.map((column) => (
          <KanbanColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={column.tasks}
            onDrop={handleDrop}
            onStatusChange={handleStatusChange}
            onDelete={onTaskDelete}
            icon={column.icon}
            iconWrapperClass={column.iconWrapperClass}
          />
        ))}
      </div>
    </div>
  )
}
