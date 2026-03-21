"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface TaskInput {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export default function AddProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [project, setProject] = useState({
    title: "",
    description: "",
  });
  
  const [tasks, setTasks] = useState<TaskInput[]>([
    { title: "", description: "", priority: "medium" }
  ]);

  const addTask = () => {
    setTasks([...tasks, { title: "", description: "", priority: "medium" }]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof TaskInput, value: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setTasks(updatedTasks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error("User not authenticated. Please sign in.");
      }

      // Insert project
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          title: project.title,
          description: project.description,
          status: "active",
          source_type: "manual",
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (projectError) {
        throw new Error(`Failed to add project: ${projectError.message}`);
      }

      // Insert tasks if any
      if (tasks.length > 0 && tasks[0].title) {
        const tasksToInsert = tasks
          .filter(task => task.title.trim()) // Only insert tasks with titles
          .map((task, index) => ({
            project_id: projectData.id,
            title: task.title,
            description: task.description || null,
            priority: task.priority,
            position: index,
            created_by: "manual",
            status: "todo",
            is_completed: false,
          }));

        if (tasksToInsert.length > 0) {
          const { error: tasksError } = await supabase
            .from("tasks")
            .insert(tasksToInsert);

          if (tasksError) {
            throw new Error(`Failed to add tasks: ${tasksError.message}`);
          }
        }
      }

      setSuccess(true);
      setProject({ title: "", description: "" });
      setTasks([{ title: "", description: "", priority: "medium" }]);
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Project</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            Project added successfully!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={project.title}
                onChange={(e) => setProject({ ...project, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project title"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description *
              </label>
              <textarea
                required
                value={project.description}
                onChange={(e) => setProject({ ...project, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project description"
              />
            </div>
          </div>
          
          {/* Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tasks</h2>
              <button
                type="button"
                onClick={addTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                + Add Task
              </button>
            </div>
            
            {tasks.map((task, index) => (
              <div key={index} className="mb-6 p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium">Task {index + 1}</h3>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeTask(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => updateTask(index, "title", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task title"
                  />
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={task.description}
                    onChange={(e) => updateTask(index, "description", e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task description (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={task.priority}
                    onChange={(e) => updateTask(index, "priority", e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? "Adding Project..." : "Add Project"}
          </button>
        </form>
      </div>
    </div>
  );
}