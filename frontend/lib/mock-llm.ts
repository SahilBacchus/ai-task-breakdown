import { Task, ChatMessage } from "./types"

// Simulated delay to mimic API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

// Sample task templates based on common project types
const taskTemplates: Record<string, Omit<Task, "id" | "createdAt">[]> = {
  web: [
    { title: "Set up project structure", description: "Initialize the project with necessary dependencies and folder structure", status: "todo", estimatedTime: "2 hours", priority: "high" },
    { title: "Design wireframes", description: "Create wireframes for main pages and user flows", status: "todo", estimatedTime: "4 hours", priority: "high" },
    { title: "Build UI components", description: "Develop reusable UI components based on design system", status: "todo", estimatedTime: "6 hours", priority: "medium" },
    { title: "Implement navigation", description: "Set up routing and navigation between pages", status: "todo", estimatedTime: "2 hours", priority: "medium" },
    { title: "Add responsive styling", description: "Ensure the application works well on all screen sizes", status: "todo", estimatedTime: "3 hours", priority: "medium" },
    { title: "Test and fix bugs", description: "Perform testing and resolve any issues found", status: "todo", estimatedTime: "4 hours", priority: "low" },
  ],
  mobile: [
    { title: "Define app architecture", description: "Plan the overall structure and state management approach", status: "todo", estimatedTime: "3 hours", priority: "high" },
    { title: "Create screen layouts", description: "Design and implement main screen layouts", status: "todo", estimatedTime: "5 hours", priority: "high" },
    { title: "Implement authentication", description: "Set up user login and registration flows", status: "todo", estimatedTime: "4 hours", priority: "high" },
    { title: "Build core features", description: "Develop the main functionality of the application", status: "todo", estimatedTime: "8 hours", priority: "medium" },
    { title: "Add offline support", description: "Implement data caching for offline usage", status: "todo", estimatedTime: "3 hours", priority: "low" },
  ],
  api: [
    { title: "Design API endpoints", description: "Plan RESTful endpoints and data models", status: "todo", estimatedTime: "2 hours", priority: "high" },
    { title: "Set up database schema", description: "Create database tables and relationships", status: "todo", estimatedTime: "3 hours", priority: "high" },
    { title: "Implement CRUD operations", description: "Build create, read, update, delete functionality", status: "todo", estimatedTime: "5 hours", priority: "medium" },
    { title: "Add authentication middleware", description: "Secure endpoints with JWT or session auth", status: "todo", estimatedTime: "3 hours", priority: "high" },
    { title: "Write API documentation", description: "Document all endpoints with examples", status: "todo", estimatedTime: "2 hours", priority: "low" },
  ],
  general: [
    { title: "Define project scope", description: "Clearly outline what the project will accomplish", status: "todo", estimatedTime: "1 hour", priority: "high" },
    { title: "Research and planning", description: "Gather information and create a detailed plan", status: "todo", estimatedTime: "3 hours", priority: "high" },
    { title: "Core implementation", description: "Build the main features and functionality", status: "todo", estimatedTime: "6 hours", priority: "medium" },
    { title: "Review and iterate", description: "Test the implementation and make improvements", status: "todo", estimatedTime: "2 hours", priority: "medium" },
    { title: "Documentation", description: "Create documentation for future reference", status: "todo", estimatedTime: "2 hours", priority: "low" },
  ],
}

// Detect project type from description
function detectProjectType(description: string): string {
  const lower = description.toLowerCase()
  if (lower.includes("website") || lower.includes("web app") || lower.includes("landing page") || lower.includes("frontend")) {
    return "web"
  }
  if (lower.includes("mobile") || lower.includes("ios") || lower.includes("android") || lower.includes("app")) {
    return "mobile"
  }
  if (lower.includes("api") || lower.includes("backend") || lower.includes("server") || lower.includes("database")) {
    return "api"
  }
  return "general"
}

// Generate tasks from project description
export async function generateTasksFromDescription(description: string): Promise<Task[]> {
  await delay(2000 + Math.random() * 1500) // 2-3.5 second delay
  
  const projectType = detectProjectType(description)
  const templates = taskTemplates[projectType]
  
  // Customize task titles based on description keywords
  const tasks: Task[] = templates.map(template => ({
    ...template,
    id: generateId(),
    createdAt: new Date(),
  }))
  
  return tasks
}

// Process chat message and return response + any task modifications
export async function processChatMessage(
  message: string,
  currentTasks: Task[]
): Promise<{ response: string; updatedTasks: Task[]; newTask?: Task }> {
  await delay(800 + Math.random() * 700) // 0.8-1.5 second delay
  
  const lower = message.toLowerCase()
  let updatedTasks = [...currentTasks]
  let response = ""
  let newTask: Task | undefined
  
  // Handle "add task" requests
  if (lower.includes("add") && (lower.includes("task") || lower.includes("item"))) {
    const taskMatch = message.match(/add (?:a )?(?:new )?(?:task|item)(?:\s*:?\s*)?["']?([^"']+)["']?/i)
    const taskTitle = taskMatch?.[1]?.trim() || "New task"
    
    newTask = {
      id: generateId(),
      title: taskTitle,
      description: "Added via chat",
      status: "todo",
      priority: "medium",
      createdAt: new Date(),
    }
    
    response = `I've added a new task: "${taskTitle}". You can find it in your To Do column.`
  }
  // Handle "remove/delete task" requests
  else if ((lower.includes("remove") || lower.includes("delete")) && lower.includes("task")) {
    const taskToRemove = currentTasks.find(t => 
      lower.includes(t.title.toLowerCase())
    )
    
    if (taskToRemove) {
      updatedTasks = currentTasks.filter(t => t.id !== taskToRemove.id)
      response = `I've removed the task: "${taskToRemove.title}".`
    } else {
      response = "I couldn't find a task matching that description. Could you be more specific about which task you'd like to remove?"
    }
  }
  // Handle "mark as done/complete" requests
  else if ((lower.includes("mark") || lower.includes("complete") || lower.includes("finish")) && (lower.includes("done") || lower.includes("complete") || lower.includes("finished"))) {
    const taskToComplete = currentTasks.find(t => 
      lower.includes(t.title.toLowerCase())
    )
    
    if (taskToComplete) {
      updatedTasks = currentTasks.map(t => 
        t.id === taskToComplete.id ? { ...t, status: "done" as const } : t
      )
      response = `Great work! I've marked "${taskToComplete.title}" as done.`
    } else {
      response = "I couldn't find a task matching that description. Which task would you like to mark as complete?"
    }
  }
  // Handle "move to in progress" requests
  else if (lower.includes("start") || lower.includes("progress") || lower.includes("working")) {
    const taskToStart = currentTasks.find(t => 
      lower.includes(t.title.toLowerCase())
    )
    
    if (taskToStart) {
      updatedTasks = currentTasks.map(t => 
        t.id === taskToStart.id ? { ...t, status: "in-progress" as const } : t
      )
      response = `Got it! I've moved "${taskToStart.title}" to In Progress.`
    } else {
      response = "Which task would you like to start working on?"
    }
  }
  // Handle priority changes
  else if (lower.includes("priority")) {
    const priorityMatch = lower.match(/(high|medium|low)\s*priority/i)
    const priority = priorityMatch?.[1]?.toLowerCase() as "high" | "medium" | "low" | undefined
    
    if (priority) {
      const taskToUpdate = currentTasks.find(t => 
        lower.includes(t.title.toLowerCase())
      )
      
      if (taskToUpdate) {
        updatedTasks = currentTasks.map(t => 
          t.id === taskToUpdate.id ? { ...t, priority } : t
        )
        response = `I've updated "${taskToUpdate.title}" to ${priority} priority.`
      } else {
        response = "Which task would you like to update the priority for?"
      }
    } else {
      response = "What priority level would you like to set? (high, medium, or low)"
    }
  }
  // Handle general queries
  else if (lower.includes("how many") || lower.includes("status") || lower.includes("progress")) {
    const todoCount = currentTasks.filter(t => t.status === "todo").length
    const inProgressCount = currentTasks.filter(t => t.status === "in-progress").length
    const doneCount = currentTasks.filter(t => t.status === "done").length
    
    response = `Here's your current progress:\n- To Do: ${todoCount} tasks\n- In Progress: ${inProgressCount} tasks\n- Done: ${doneCount} tasks\n\nKeep up the great work!`
  }
  // Default response
  else {
    response = "I can help you manage your tasks! Try:\n- \"Add a task: [task name]\"\n- \"Mark [task name] as done\"\n- \"Start [task name]\"\n- \"Remove [task name]\"\n- \"Set [task name] to high priority\"\n- \"How many tasks do I have?\""
  }
  
  return { response, updatedTasks, newTask }
}