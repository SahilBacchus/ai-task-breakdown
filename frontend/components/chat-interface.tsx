'use client'

import { useState, useRef, useEffect } from 'react'
import { Task, ChatMessage } from '@/lib/types'
import { processChatMessage, generateId } from '@/lib/mock-llm'
import { X, Send, Bot, User, Loader2 } from 'lucide-react'
import styles from './chat-interface.module.css'


interface ChatInterfaceProps {
  messages: ChatMessage[]
  tasks: Task[]
  onMessagesUpdate: (messages: ChatMessage[]) => void
  onTasksUpdate: (tasks: Task[]) => void
  onClose: () => void
}

export function ChatInterface({
  messages,
  tasks,
  onMessagesUpdate,
  onTasksUpdate,
  onClose,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    onMessagesUpdate(updatedMessages)
    setInput('')
    setIsProcessing(true)

    try {
      const { response, updatedTasks, newTask } = await processChatMessage(
        input,
        tasks
      )

      if (newTask) {
        onTasksUpdate([...updatedTasks, newTask])
      } else {
        onTasksUpdate(updatedTasks)
      }

      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }
      onMessagesUpdate([...updatedMessages, assistantMessage])
    } catch {
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      onMessagesUpdate([...updatedMessages, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}>
            <Bot className={styles.headerIconSvg} />
          </div>
          <div className={styles.headerText}>
            <h2 className={styles.headerTitle}>Task Assistant</h2>
            <p className={styles.headerSubtitle}>Modify tasks with chat</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close chat"
        >
          <X className={styles.closeIcon} />
        </button>
      </div>

      <div className={styles.messagesArea} ref={scrollRef}>
        <div className={styles.messagesList}>
          {messages.length === 0 && (
            <div className={styles.welcomeCard}>
              <p className={styles.welcomeText}>
                Hi! I can help you manage your tasks. Try saying:
              </p>
              <ul className={styles.welcomeList}>
                <li className={styles.welcomeListItem}>
                  &bull; &quot;Add a task: Review documentation&quot;
                </li>
                <li className={styles.welcomeListItem}>
                  &bull; &quot;Mark [task name] as done&quot;
                </li>
                <li className={styles.welcomeListItem}>
                  &bull; &quot;Start working on [task name]&quot;
                </li>
                <li className={styles.welcomeListItem}>
                  &bull; &quot;Remove [task name]&quot;
                </li>
                <li className={styles.welcomeListItem}>
                  &bull; &quot;How many tasks do I have?&quot;
                </li>
              </ul>
            </div>
          )}

          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isProcessing && (
            <div className={styles.loadingIndicator}>
              <div className={styles.loadingIconWrapper}>
                <Bot className={styles.loadingIcon} />
              </div>
              <div className={styles.loadingContent}>
                <Loader2 className={styles.loadingSpinner} />
                <span className={styles.loadingText}>Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isProcessing}
            className={styles.input}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className={styles.sendButton}
            aria-label="Send message"
          >
            <Send className={styles.sendIcon} />
          </button>
        </div>
      </div>
    </div>
  )
}

interface ChatBubbleProps {
  message: ChatMessage
}

function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`${styles.bubble} ${isUser ? styles.bubbleUser : ''}`}>
      <div
        className={`${styles.bubbleAvatar} ${isUser ? styles.bubbleAvatarUser : styles.bubbleAvatarAssistant}`}
      >
        {isUser ? (
          <User
            className={`${styles.bubbleAvatarIcon} ${styles.bubbleAvatarIconUser}`}
          />
        ) : (
          <Bot
            className={`${styles.bubbleAvatarIcon} ${styles.bubbleAvatarIconAssistant}`}
          />
        )}
      </div>
      <div
        className={`${styles.bubbleContent} ${isUser ? styles.bubbleContentUser : styles.bubbleContentAssistant}`}
      >
        <p className={styles.bubbleText}>{message.content}</p>
        <p
          className={`${styles.bubbleTime} ${isUser ? styles.bubbleTimeUser : styles.bubbleTimeAssistant}`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}