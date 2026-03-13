'use client'

import { useState, useRef, useEffect } from 'react'
import { Task, TaskStatus } from '@/lib/types'
import { Clock, GripVertical, MoreHorizontal, CheckCircle2, Circle, Timer } from 'lucide-react'
import styles from './task-card.module.css'

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
  isDragging?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

const statusIcons = {
  todo: Circle,
  'in-progress': Timer,
  done: CheckCircle2,
}

export function TaskCard({
  task,
  onStatusChange,
  onDelete,
  isDragging,
  dragHandleProps,
}: TaskCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const StatusIcon = statusIcons[task.status]

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getPriorityClass = () => {
    switch (task.priority) {
      case 'high':
        return styles.badgeHigh
      case 'medium':
        return styles.badgeMedium
      case 'low':
        return styles.badgeLow
    }
  }

  const getStatusClass = () => {
    switch (task.status) {
      case 'done':
        return styles.statusDone
      case 'in-progress':
        return styles.statusInProgress
      default:
        return styles.statusTodo
    }
  }

  return (
    <div className={`${styles.card} ${isDragging ? styles.cardDragging : ''}`}>
      <div className={styles.header}>
        <div {...dragHandleProps} className={styles.dragHandle}>
          <GripVertical className={styles.dragHandleIcon} />
        </div>

        <div className={styles.content}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{task.title}</h3>
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                className={styles.menuButton}
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Task options"
              >
                <MoreHorizontal className={styles.menuIcon} />
              </button>

              {showMenu && (
                <div className={styles.dropdown}>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      onStatusChange(task.id, 'todo')
                      setShowMenu(false)
                    }}
                  >
                    <Circle className={styles.dropdownItemIcon} />
                    Move to To Do
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      onStatusChange(task.id, 'in-progress')
                      setShowMenu(false)
                    }}
                  >
                    <Timer className={styles.dropdownItemIcon} />
                    Move to In Progress
                  </button>
                  <button
                    className={styles.dropdownItem}
                    onClick={() => {
                      onStatusChange(task.id, 'done')
                      setShowMenu(false)
                    }}
                  >
                    <CheckCircle2 className={styles.dropdownItemIcon} />
                    Move to Done
                  </button>
                  <div className={styles.dropdownSeparator} />
                  <button
                    className={`${styles.dropdownItem} ${styles.dropdownItemDestructive}`}
                    onClick={() => {
                      onDelete(task.id)
                      setShowMenu(false)
                    }}
                  >
                    Delete task
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className={styles.description}>{task.description}</p>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.meta}>
          <span className={`${styles.badge} ${getPriorityClass()}`}>
            {task.priority}
          </span>
          {task.estimatedTime && (
            <span className={styles.time}>
              <Clock className={styles.timeIcon} />
              {task.estimatedTime}
            </span>
          )}
        </div>
        <StatusIcon className={`${styles.statusIcon} ${getStatusClass()}`} />
      </div>
    </div>
  )
}
