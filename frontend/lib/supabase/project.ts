// Import projects with user association
import { supabase } from "@/lib/supabase/client";

interface ImportProject {
  title: string;
  description: string;
  status?: string;
  source_type?: string;
  tasks?: ImportTask[];
}

interface ImportTask {
  title: string;
  description?: string;
  priority?: string;
  estimated_time?: string;
  status?: string;
}

export async function importProjectWithTasks(
  userId: string,
  project: ImportProject,
  options?: {
    generateTasksWithAI?: boolean;
    aiDescription?: string;
    modelName?: string;
  }
) {
  // 1. Insert the project
  const { data: projectData, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      title: project.title,
      description: project.description,
      status: project.status || "active",
      source_type: project.source_type || "manual",
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (projectError) {
    throw new Error(`Failed to import project: ${projectError.message}`);
  }

  // 2. Insert tasks if they exist
  let importedTasks = [];
  if (project.tasks && project.tasks.length > 0) {
    const tasksToInsert = project.tasks.map((task, index) => ({
      project_id: projectData.id,
      title: task.title,
      description: task.description || null,
      priority: task.priority || "medium",
      estimated_time: task.estimated_time || null,
      status: task.status || "todo",
      position: index,
      created_by: "import",
    }));

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .insert(tasksToInsert)
      .select();

    if (tasksError) {
      throw new Error(`Failed to import tasks: ${tasksError.message}`);
    }
    importedTasks = tasksData;
  }

  // 3. Optionally generate tasks with AI and store generation record
  if (options?.generateTasksWithAI && options.aiDescription) {
    // Call your FastAPI endpoint
    const response = await fetch("http://localhost:8000/generate-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: options.aiDescription }),
    });

    if (!response.ok) {
      throw new Error("AI generation failed");
    }

    const { tasks: aiTasks } = await response.json();

    // Insert AI-generated tasks
    const aiTasksToInsert = aiTasks.map((task: any, index: number) => ({
      project_id: projectData.id,
      title: task.title,
      description: task.description,
      priority: task.priority.toLowerCase(),
      position: importedTasks.length + index,
      created_by: "llm",
    }));

    const { data: aiTasksData, error: aiTasksError } = await supabase
      .from("tasks")
      .insert(aiTasksToInsert)
      .select();

    if (aiTasksError) {
      throw new Error(`Failed to insert AI tasks: ${aiTasksError.message}`);
    }

    // Record the generation
    const { error: generationError } = await supabase
      .from("project_generations")
      .insert({
        project_id: projectData.id,
        input_description: options.aiDescription,
        model_name: options.modelName || "gemini-3.1-flash-lite-preview",
        raw_response: { tasks: aiTasks },
        parsed_task_count: aiTasks.length,
      });

    if (generationError) {
      console.error("Failed to record generation:", generationError);
    }

    importedTasks = [...importedTasks, ...aiTasksData];
  }

  return {
    project: projectData,
    tasks: importedTasks,
  };
}