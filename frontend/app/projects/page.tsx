'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
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
import { supabase } from '@/lib/supabase/client';
import { ProjectInput } from '@/components/project-input';
import { KanbanBoard } from '@/components/kanban-board';
import { ListView } from '@/components/list-view';
import { ChatInterface } from '@/components/chat-interface';
import { Task, ChatMessage } from '@/lib/types';
import {
  fetchUserProjects,
  fetchProjectTasks,
  generateTasks,
  createProject,
  updateTask,
  deleteTask,
  deleteProject,
} from '@/lib/api';

type ViewMode = 'kanban' | 'list';

interface Project {
  id: string;
  title: string;
  description: string;
  tasks?: Task[];
}

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessagesMap, setChatMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const currentChatMessages = activeProjectId ? (chatMessagesMap[activeProjectId] || []) : [];

  // 1. Check authentication and load projects
  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push('/login');
        return;
      }

      try {
        setIsLoadingProjects(true);
        const projs = await fetchUserProjects();
        const formattedProjects = projs.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          tasks: [],
        }));
        setProjects(formattedProjects);
        if (formattedProjects.length > 0) {
          setActiveProjectId(formattedProjects[0].id);
        }
      } catch (err: any) {
        setAuthError(err.message);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    checkAuthAndLoad();
  }, [router]);

  // 2. Load tasks for the active project when it changes
  useEffect(() => {
    const loadTasks = async () => {
      if (!activeProjectId) return;
      const existing = projects.find(p => p.id === activeProjectId);
      if (existing?.tasks?.length) return;

      setIsLoadingTasks(true);
      try {
        const tasks = await fetchProjectTasks(activeProjectId);
        const formattedTasks: Task[] = tasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          estimatedTime: t.estimated_time,
          createdAt: new Date(t.created_at),
        }));
        setProjects(prev =>
          prev.map(p =>
            p.id === activeProjectId ? { ...p, tasks: formattedTasks } : p
          )
        );
      } catch (err) {
        console.error('Failed to load tasks:', err);
      } finally {
        setIsLoadingTasks(false);
      }
    };
    loadTasks();
  }, [activeProjectId, projects]);

  // 3. Task updates
  const handleTaskUpdate = async (updatedTasks: Task[]) => {
    // Optimistically update local state
    setProjects(prev =>
      prev.map(p =>
        p.id === activeProjectId ? { ...p, tasks: updatedTasks } : p
      )
    );
    // Find tasks that changed status or priority
    const oldTasks = projects.find(p => p.id === activeProjectId)?.tasks || [];
    const changedTasks = updatedTasks.filter(newTask => {
      const oldTask = oldTasks.find(t => t.id === newTask.id);
      return oldTask && (oldTask.status !== newTask.status || oldTask.priority !== newTask.priority);
    });
    for (const task of changedTasks) {
      try {
        await updateTask(task.id, {
          status: task.status,
          priority: task.priority,
        });
      } catch (err) {
        console.error('Failed to update task', task.id, err);
      }
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    const updatedTasks = activeProject?.tasks?.filter(t => t.id !== taskId) || [];
    setProjects(prev =>
      prev.map(p =>
        p.id === activeProjectId ? { ...p, tasks: updatedTasks } : p
      )
    );
    try {
      await deleteTask(taskId);
    } catch (err) {
      console.error('Failed to delete task', taskId, err);
    }
  };

  // 4. Chat message management
  const handleMessagesUpdate = (projectId: string, newMessages: ChatMessage[]) => {
    setChatMessagesMap(prev => ({ ...prev, [projectId]: newMessages }));
  };

  // 5. Create new project
  const handleCreateProject = async (title: string, description: string) => {
    try {
        const generatedTasks = await generateTasks(title, description);      
        const newProjectData = {
        title,
        description,
        status: 'active',
        source_type: 'ai_generated',
        tasks: generatedTasks.map((t: any) => ({
          title: t.title,
          description: t.description,
          priority: t.priority,
        })),
      };
      const createdProject = await createProject(newProjectData);
      const newProject: Project = {
        id: createdProject.id,
        title: createdProject.title,
        description: createdProject.description,
        tasks: [],
      };
      setProjects(prev => [...prev, newProject]);
      setActiveProjectId(newProject.id);
      // Initialize empty chat history for the new project
      setChatMessagesMap(prev => ({ ...prev, [newProject.id]: [] }));
    } catch (err) {
      console.error('Failed to create project:', err);
      alert('Failed to create project. Please try again.');
    }
  };

  // 6. Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Loading states
  if (isLoadingProjects) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-red-500">Error: {authError}</div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[oklch(0.12_0.005_285)] text-[oklch(0.98_0_0)] font-sans">
      <aside className="flex w-64 flex-col border-r border-[oklch(0.28_0.005_285)] bg-[oklch(0.17_0.005_285)]">
        <div className="flex items-center gap-2 border-b border-[oklch(0.28_0.005_285)] p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[oklch(0.65_0.2_275)] shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight">AI Task Breakdown</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-2 text-xs font-semibold tracking-wider text-[oklch(0.65_0_0)]">
            MY PROJECTS
          </div>
          <nav className="flex flex-col gap-1">
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

            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between">
                <button
                  onClick={() => setActiveProjectId(project.id)}
                  className={`flex flex-1 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeProjectId === project.id
                      ? 'bg-[oklch(0.65_0.2_275/0.15)] text-[oklch(0.65_0.2_275)]'
                      : 'text-[oklch(0.65_0_0)] hover:bg-[oklch(0.22_0.005_285)] hover:text-[oklch(0.98_0_0)]'
                  }`}
                >
                  <Folder className="h-4 w-4" />
                  <span className="truncate">{project.title}</span>
                </button>
                <button
                  onClick={async () => {
                    if (confirm(`Delete project "${project.title}"? This will delete all tasks.`)) {
                      try {
                        await deleteProject(project.id);
                        setProjects(prev => prev.filter(p => p.id !== project.id));
                        // Also remove chat history for this project
                        setChatMessagesMap(prev => {
                          const newMap = { ...prev };
                          delete newMap[project.id];
                          return newMap;
                        });
                        if (activeProjectId === project.id) {
                          setActiveProjectId(projects.length > 1 ? projects[0].id : null);
                        }
                      } catch (err) {
                        console.error('Failed to delete project', err);
                        alert('Failed to delete project. Please try again.');
                      }
                    }
                  }}
                  className="text-red-400 hover:text-red-300 p-2"
                  title="Delete project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </nav>

          <div className="border-t border-[oklch(0.28_0.005_285)] p-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm font-medium text-[oklch(0.65_0_0)] transition-colors hover:text-[oklch(0.98_0_0)]"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden relative">
        {activeProjectId === null ? (
          <div className="flex-1 overflow-y-auto">
            <ProjectInput onSubmit={handleCreateProject} />
          </div>
        ) : activeProject ? (
          <div className="flex h-full flex-col p-6">
            <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">{activeProject.title}</h1>
                <p className="text-sm text-[oklch(0.65_0_0)]">
                  {activeProject.description}
                </p>
              </div>
              <div className="flex items-center gap-3">
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

            <div className="flex flex-1 gap-6 overflow-hidden">
              <div className="flex-1 overflow-y-auto transition-all duration-300">
                {isLoadingTasks ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-gray-500">Loading tasks...</div>
                  </div>
                ) : viewMode === 'kanban' ? (
                  <KanbanBoard
                    tasks={activeProject.tasks || []}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                  />
                ) : (
                  <ListView
                    tasks={activeProject.tasks || []}
                    onTaskUpdate={handleTaskUpdate}
                    onTaskDelete={handleTaskDelete}
                  />
                )}
              </div>
              {isChatOpen && (
                <div className="w-96 flex-shrink-0 overflow-hidden rounded-xl border border-[oklch(0.28_0.005_285)] bg-[oklch(0.17_0.005_285)] shadow-xl animate-in slide-in-from-right-8 duration-300">
                  <ChatInterface
                    messages={currentChatMessages}
                    tasks={activeProject.tasks || []}
                    projectId={activeProjectId}
                    onMessagesUpdate={(newMessages) => handleMessagesUpdate(activeProjectId, newMessages)}
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
