'use client'

import { TaskCard } from '@/components/task-card'
import { Task, TaskStatus } from '@/lib/types'
import { CheckCircle2, ChevronDown, ChevronsUpDown, ChevronUp, Circle, Timer } from 'lucide-react'
import { useMemo, useState } from 'react'
import styles from './list-view.module.css'

interface ListViewProps {
  tasks: Task[]
  onTaskUpdate: (tasks: Task[]) => void
  onTaskDelete: (taskId: string) => void
}

type SortField = 'title' | 'priority' | 'estimatedTime' | 'createdAt'
type SortDirection = 'asc' | 'desc'

interface SortState {
  field: SortField
  direction: SortDirection
}

const STATUS_CONFIG: {
  status: TaskStatus
  title: string
  icon: React.ReactNode
  iconWrapperClass: string
}[] = [
  {
    status: 'todo',
    title: 'To Do',
    icon: <Circle size={14} />,
    iconWrapperClass: styles.iconTodo,
  },
  {
    status: 'in-progress',
    title: 'In Progress',
    icon: <Timer size={14} />,
    iconWrapperClass: styles.iconInProgress,
  },
  {
    status: 'done',
    title: 'Done',
    icon: <CheckCircle2 size={14} />,
    iconWrapperClass: styles.iconDone,
  },
]

const SORT_COLUMNS: { label: string; field: SortField }[] = [
  { label: 'Title', field: 'title' },
  { label: 'Priority', field: 'priority' },
  { label: 'Est. Time', field: 'estimatedTime' },
  { label: 'Created', field: 'createdAt' },
]

function SortIcon({ field, sort }: { field: SortField; sort: SortState }) {
  if (sort.field !== field) return <ChevronsUpDown size={13} className={styles.sortIconInactive} />
  return sort.direction === 'asc'
    ? <ChevronUp size={13} className={styles.sortIconActive} />
    : <ChevronDown size={13} className={styles.sortIconActive} />
}

function sortTasks(tasks: Task[], sort: SortState): Task[] {
  return [...tasks].sort((a, b) => {
    let valA: string | number | undefined
    let valB: string | number | undefined

    switch (sort.field) {
      case 'title':
        valA = a.title?.toLowerCase() ?? ''
        valB = b.title?.toLowerCase() ?? ''
        break
      case 'priority': {
        const order = { high: 0, medium: 1, low: 2, undefined: 3 }
        valA = order[(a.priority as keyof typeof order) ?? 'undefined'] ?? 3
        valB = order[(b.priority as keyof typeof order) ?? 'undefined'] ?? 3
        break
      }
      case 'estimatedTime':
        valA = a.estimatedTime ?? ''
        valB = b.estimatedTime ?? ''
        break
      case 'createdAt':
        valA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        valB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        break
    }

    if (valA === undefined) valA = ''
    if (valB === undefined) valB = ''

    if (valA < valB) return sort.direction === 'asc' ? -1 : 1
    if (valA > valB) return sort.direction === 'asc' ? 1 : -1
    return 0
  })
}

interface StatusGroupProps {
  status: TaskStatus
  title: string
  icon: React.ReactNode
  iconWrapperClass: string
  tasks: Task[]
  sort: SortState
  onSortChange: (field: SortField) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
  onDragStart: (e: React.DragEvent, taskId: string) => void
  onDragOver: (e: React.DragEvent, status: TaskStatus) => void
  onDrop: (e: React.DragEvent, status: TaskStatus) => void
  draggedOverStatus: TaskStatus | null
}

function StatusGroup({
  status,
  title,
  icon,
  iconWrapperClass,
  tasks,
  sort,
  onSortChange,
  onStatusChange,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  draggedOverStatus,
}: StatusGroupProps) {
  const [collapsed, setCollapsed] = useState(false)
  const sorted = useMemo(() => sortTasks(tasks, sort), [tasks, sort])

  const isDraggedOver = draggedOverStatus === status

  return (
    <div 
      className={`${styles.group} ${isDraggedOver ? styles.groupDraggedOver : ''}`}
      onDragOver={(e) => onDragOver(e, status)}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Group header */}
      <div className={styles.groupHeader} onClick={() => setCollapsed((c) => !c)}>
        <div className={`${styles.groupIcon} ${iconWrapperClass}`}>{icon}</div>
        <span className={styles.groupTitle}>{title}</span>
        <span className={styles.groupCount}>{tasks.length}</span>
        <span className={styles.groupChevron}>
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </span>
      </div>

      {!collapsed && (
        <div className={styles.groupBody}>
          {/* Column headers */}
          <div className={styles.columnHeaders}>
            <span className={styles.colTask}>Task</span>
            {SORT_COLUMNS.map(({ label, field }) => (
              <button
                key={field}
                className={styles.colHeader}
                onClick={(e) => { e.stopPropagation(); onSortChange(field) }}
              >
                {label}
                <SortIcon field={field} sort={sort} />
              </button>
            ))}
            <span className={styles.colActions} />
          </div>

          {/* Rows */}
          {sorted.length === 0 ? (
            <div className={styles.emptyGroup}>No tasks in this group</div>
          ) : (
            sorted.map((task) => (
              <div 
                key={task.id} 
                className={styles.row}
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
                onDragOver={(e) => e.preventDefault()}
              >
                <TaskCard
                  task={task}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  isDragging={false}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export function ListView({ tasks, onTaskUpdate, onTaskDelete }: ListViewProps) {
  const [sort, setSort] = useState<SortState>({ field: 'createdAt', direction: 'asc' })
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [draggedOverStatus, setDraggedOverStatus] = useState<TaskStatus | null>(null)

  const handleSortChange = (field: SortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { field, direction: 'asc' }
    )
  }

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, status } : t))
    onTaskUpdate(updated)
  }

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDraggedOverStatus(status)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault()
    
    const taskId = e.dataTransfer.getData('text/plain')
    setDraggedOverStatus(null)
    setDraggedTaskId(null)

    if (!taskId) return

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    // Only update if the status is actually changing
    if (task.status !== targetStatus) {
      handleStatusChange(taskId, targetStatus)
    }
  }

  const handleDragEnd = () => {
    setDraggedOverStatus(null)
    setDraggedTaskId(null)
  }

  return (
    <div className={styles.container} onDragEnd={handleDragEnd}>
      {STATUS_CONFIG.map(({ status, title, icon, iconWrapperClass }) => (
        <StatusGroup
          key={status}
          status={status}
          title={title}
          icon={icon}
          iconWrapperClass={iconWrapperClass}
          tasks={tasks.filter((t) => t.status === status)}
          sort={sort}
          onSortChange={handleSortChange}
          onStatusChange={handleStatusChange}
          onDelete={onTaskDelete}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          draggedOverStatus={draggedOverStatus}
        />
      ))}
    </div>
  )
}