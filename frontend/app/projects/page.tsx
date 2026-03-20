// app/projects/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  List,
  MessageSquare,
  X,
  Plus,
  Folder,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { ProjectInput } from '@/components/project-input';
import { KanbanBoard } from '@/components/kanban-board';
import { ListView } from '@/components/list-view';
import { ChatInterface } from '@/components/chat-interface';
import { Task, ChatMessage } from '@/lib/types';

// Mock data – replace with real API calls later
const INITIAL_PROJECTS = [
  {
    id: '1',
    title: 'ENSF 400 Project',
    description: 'AI Task Breakdown Application',
    tasks: [
      {
        id: 't1',
        title: 'Design Database Schema',
        status: 'done' as const,
        priority: 'high' as const,
        description: 'Create Schema for Users, Projects, Tasks',
        estimatedTime: '2h',
        createdAt: new Date(),
      },
      {
        id: 't2',
        title: 'Implement Authentication',
        status: 'in-progress' as const,
        priority: 'high' as const,
        description: 'Integrate Supabase Auth for login',
        estimatedTime: '4h',
        createdAt: new Date(),
      },
      {
        id: 't3',
        title: 'Setup Dev Environment',
        status: 'done' as const,
        priority: 'medium' as const,
        description: 'npm install and environment variables',
        estimatedTime: '1h',
        createdAt: new Date(),
      },
    ],
  },
  {
    id: '2',
    title: 'SENG 401 Project',
    description: 'Software Architecture assignment',
    tasks: [
      {
        id: 't4',
        title: 'Draft Architecture Diagram',
        status: 'todo' as const,
        priority: 'high' as const,
        description: 'C4 model for the new system',
        estimatedTime: '3h',
        createdAt: new Date(),
      },
    ],
  },
];

type ViewMode = 'kanban' | 'list';

export default function ProjectsPage() {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    INITIAL_PROJECTS[0].id // open the first project by default
  );

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Handlers for task updates
  const handleTaskUpdate = (updatedTasks: Task[]) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId ? { ...p, tasks: updatedTasks } : p
      )
    );
  };

  const handleTaskDelete = (taskId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
          : p
      )
    );
  };

  // Handler for creating a new project
  const handleCreateProject = (title: string, description: string) => {
    const newProject = {
      id: Date.now().toString(),
      title,
      description,
      tasks: [] as Task[], // In a real app, call LLM to generate tasks
    };
    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newProject.id);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[oklch(0.12_0.005_285)] text-[oklch(0.98_0_0)] font-sans">
      {/* ========== LEFT SIDEBAR (Projects) ========== */}
      <aside className="flex w-64 flex-col border-r border-[oklch(0.28_0.005_285)] bg-[oklch(0.17_0.005_285)]">
        {/* Logo / Header */}
        <div className="flex items-center gap-2 border-b border-[oklch(0.28_0.005_285)] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.65_0.2_275)] shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">
            AI Task Breakdown
          </span>
        </div>

        {/* Projects list */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-2 text-xs font-semibold tracking-wider text-[oklch(0.65_0_0)]">
            MY PROJECTS
          </div>
          <nav className="flex flex-col gap-1">
            {/* New Project button */}
            <button
              onClick={() => setActiveProjectId(null)}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeProjectId === null
                  ? 'bg-[oklch(0.65_0.2_275/0.15)] text-[oklch(0.65_0.2_275)]'
                  : 'text-[oklch(0.65_0_0)] hover:bg-[oklch(0.22_0.005_285)] hover:text-[oklch(0.98_0_0)]'
              }`}
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>

            {/* Existing projects */}
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProjectId(project.id)}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeProjectId === project.id
                    ? 'bg-[oklch(0.65_0.2_275/0.15)] text-[oklch(0.65_0.2_275)]'
                    : 'text-[oklch(0.65_0_0)] hover:bg-[oklch(0.22_0.005_285)] hover:text-[oklch(0.98_0_0)]'
                }`}
              >
                <Folder className="h-4 w-4" />
                <span className="truncate">{project.title}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sign out link (mock) */}
        <div className="border-t border-[oklch(0.28_0.005_285)] p-4">
          <Link
            href="/login"
            className="flex items-center gap-2 text-sm font-medium text-[oklch(0.65_0_0)] transition-colors hover:text-[oklch(0.98_0_0)]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* ========== MAIN CONTENT AREA ========== */}
      <main className="flex flex-1 flex-col overflow-hidden relative">
        {/* Show ProjectInput when no project is selected */}
        {activeProjectId === null ? (
          <div className="flex-1 overflow-y-auto">
            <ProjectInput onSubmit={handleCreateProject} />
          </div>
        ) : activeProject ? (
          // Active project dashboard
          <div className="flex h-full flex-col p-6">
            {/* Top toolbar */}
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{activeProject.title}</h1>
                <p className="text-sm text-[oklch(0.65_0_0)]">
                  {activeProject.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View toggle */}
                <div className="flex overflow-hidden rounded-lg border border-[oklch(0.28_0.005_285)] bg-[oklch(0.17_0.005_285)]">
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                      viewMode === 'kanban'
                        ? 'bg-[oklch(0.22_0.005_285)] text-white'
                        : 'text-[oklch(0.65_0_0)] hover:text-white'
                    }`}
                  >
                    <LayoutGrid size={16} /> Kanban
                  </button>
                  <div className="w-[1px] bg-[oklch(0.28_0.005_285)]" />
                  <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-[oklch(0.22_0.005_285)] text-white'
                        : 'text-[oklch(0.65_0_0)] hover:text-white'
                    }`}
                  >
                    <List size={16} /> List
                  </button>
                </div>

                {/* Chat toggle */}
                <button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  className={`flex items-center gap-2 rounded-lg border border-[oklch(0.28_0.005_285)] px-3 py-1.5 text-sm font-medium transition-colors ${
                    isChatOpen
                      ? 'bg-[oklch(0.65_0.2_275)] text-white border-transparent'
                      : 'bg-[oklch(0.17_0.005_285)] text-[oklch(0.65_0_0)] hover:text-white'
                  }`}
                >
                  {isChatOpen ? <X size={16} /> : <MessageSquare size={16} />}
                  {isChatOpen ? 'Close Chat' : 'AI Assistant'}
                </button>
              </div>
            </header>

            {/* Workspace: Task view + optional chat sidebar */}
            <div className="flex flex-1 gap-6 overflow-hidden">
              {/* Task view (Kanban / List) */}
              <div className="flex-1 overflow-y-auto transition-all duration-300">
                {viewMode === 'kanban' ? (
                  <KanbanBoard
                    tasks={activeProject.tasks}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                  />
                ) : (
                  <ListView
                    tasks={activeProject.tasks}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                  />
                )}
              </div>

              {/* AI Chat Sidebar (opens on the right) */}
              {isChatOpen && (
                <div className="w-96 flex-shrink-0 overflow-hidden rounded-xl border border-[oklch(0.28_0.005_285)] bg-[oklch(0.17_0.005_285)] shadow-xl animate-in slide-in-from-right-8 duration-300">
                  <ChatInterface
                    messages={chatMessages}
                    tasks={activeProject.tasks}
                    onMessagesUpdate={setChatMessages}
                    onTasksUpdate={handleTaskUpdate}
                    onClose={() => setIsChatOpen(false)}
                  />
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}