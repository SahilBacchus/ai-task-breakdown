// lib/api.ts
import { supabase } from './supabase/client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await supabase.auth.getSession();
  const token = session.data.session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Request failed');
  }
  return res.json();
}

export async function fetchUserProjects() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const data = await fetchWithAuth(`/api/users/${user.id}/projects`);
  return data.projects;
}

export async function fetchProjectTasks(projectId: string) {
  const data = await fetchWithAuth(`/api/projects/${projectId}`);
  return data.tasks;
}

export async function generateTasks(description: string) {
  const data = await fetchWithAuth('/generate-tasks', {
    method: 'POST',
    body: JSON.stringify({ description }),
  });
  return data.tasks;
}

export async function createProject(projectData: any) {
  const data = await fetchWithAuth('/api/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
  return data.project;
}

export async function updateTask(taskId: string, updates: any) {
  const data = await fetchWithAuth(`/api/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return data.task;
}

export async function deleteTask(taskId: string) {
  await fetchWithAuth(`/api/tasks/${taskId}`, { method: 'DELETE' });
}

export async function deleteProject(projectId: string) {
  await fetchWithAuth(`/api/projects/${projectId}`, { method: 'DELETE' });
}


export async function sendChatMessage(projectId: string, message: string) {
  const data = await fetchWithAuth('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ project_id: projectId, message }),
  });
  return data;
}