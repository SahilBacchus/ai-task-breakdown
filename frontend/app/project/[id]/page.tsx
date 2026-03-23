"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useParams, useRouter } from "next/navigation";
import { Download } from "lucide-react";
import { buildCsv, downloadCsv, sanitizeCsvFilename } from "@/lib/csv";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  source_type: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  position: number;
  is_completed: boolean;
  estimated_time: string | null;
  created_at: string;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project details
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", params.id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Fetch tasks for this project
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", params.id)
        .order("position", { ascending: true });

      if (tasksError) throw tasksError;
      setTasks(tasksData || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "todo": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleExportCsv = () => {
    const csvHeaders = ["priority", "title", "description", "status"];
    const csvRows = tasks.map((task) => [
      task.priority,
      task.title,
      task.description ?? "",
      task.status,
    ]);
    const csvContent = buildCsv(csvHeaders, csvRows);
    const filename = `${sanitizeCsvFilename(project?.title || "project")}-tasks.csv`;
    downloadCsv(filename, csvContent);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error || "Project not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-500 hover:text-blue-700"
        >
          ← Back
        </button>
        
        {/* Project Header */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {project.title}
          </h1>
          <p className="text-gray-600 mb-4">{project.description}</p>
          
          <div className="flex gap-4 text-sm text-gray-500">
            <span>Status: {project.status}</span>
            <span>Source: {project.source_type}</span>
            <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
            <span>Last Updated: {new Date(project.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Tasks Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold">Tasks</h2>
            <button
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          </div>
          
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks yet for this project.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex gap-4 text-sm text-gray-500">
                        {task.estimated_time && (
                          <span>Estimated: {task.estimated_time}</span>
                        )}
                        <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                        {task.is_completed && (
                          <span className="text-green-600">✓ Completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
