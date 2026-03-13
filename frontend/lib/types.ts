export type TaskStatus = "todo" | "in-progress" | "done"

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  estimatedTime?: string
  priority: "low" | "medium" | "high"
  createdAt: Date
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface Project {
  id: string
  description: string
  tasks: Task[]
  chatHistory: ChatMessage[]
  createdAt: Date
}

export type AppScreen = "input" | "loading" | "tasks"
