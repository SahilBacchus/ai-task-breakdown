import os
import json
import uvicorn
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client

# Setup & Config
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")
if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Supabase URL or anon key missing in .env file")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')

app = FastAPI(title="AI Task Breakdown API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class ProjectInput(BaseModel):
    title: str
    description: str


# Dependency to get authenticated Supabase client using the user's token
async def get_authenticated_supabase(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    token = authorization.split(" ")[1] if authorization.startswith("Bearer ") else authorization
    supabase_client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    # Set the user's access token
    supabase_client.auth.set_session(access_token=token, refresh_token="")  # refresh token not needed
    return supabase_client

# Health Endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "online",
        "message": "AI Task Breakdown backend is running",
        "version": "1.0.0"
    }

# Get user projects
@app.get("/api/users/{user_id}/projects")
async def get_user_projects(user_id: str, supabase: Client = Depends(get_authenticated_supabase)):
    """
    Fetch all projects for a given user. Uses the user's JWT to authenticate with Supabase.
    """
    try:
        # Verify that the user_id in the URL matches the authenticated user (optional, but good for security)
        # We can get the user from the token
        # But we'll trust the frontend for now
        result = supabase.table("projects")\
            .select("id, title, description, status, created_at")\
            .eq("user_id", user_id)\
            .order("created_at", desc=True)\
            .execute()
        return {
            "success": True,
            "projects": result.data,
            "count": len(result.data)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Task Generation Endpoint
@app.post("/generate-tasks")
async def generate_tasks(project: ProjectInput):
    """
    Breaks down the given project title + description into a list of actionable tasks.
    Returns a JSON array of tasks, each with:
      - title (string)
      - description (string)
      - priority (string: "High", "Medium", or "Low")
      - estimatedTime (string, e.g., "1h", "30m", "2d")
    """
    prompt = f"""
            You are an AI task breakdown assistant. Given a project title and description, generate a detailed list of specific, actionable tasks.

            Project title: {project.title}
            Project description: {project.description}

            Return a JSON array of objects. Each object must have exactly these keys:
            - "title": a short, clear task name
            - "description": a brief explanation of what needs to be done
            - "priority": one of "High", "Medium", or "Low"
            - "estimatedTime": a time estimate in human-readable format (e.g., "30m", "2h", "1d")

            Make sure the tasks cover all the main features of the project. Order them logically if possible.
            Output ONLY the JSON array, without any extra text or formatting.
            """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Remove markdown code fences if present
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        text = text.strip()

        # Try to parse JSON; if it fails, attempt to extract the first valid JSON array
        tasks = json.loads(text)
        if not isinstance(tasks, list):
            raise ValueError("AI did not return a JSON array")

        # Validate each task has required fields
        for task in tasks:
            if not all(k in task for k in ("title", "description", "priority")):
                raise ValueError("Missing required field in task")

        return {"tasks": tasks}

    except json.JSONDecodeError as e:
        # Log the raw output for debugging
        print("Raw AI output:", response.text)
        raise HTTPException(status_code=500, detail="AI returned invalid JSON format")
    except Exception as e:
        print("Error:", str(e))
        raise HTTPException(status_code=500, detail=str(e))

    


# New data models
class TaskItem(BaseModel):
    title: str
    description: str
    priority: str  # High, Medium, Low

class ProjectCreate(BaseModel):
    title: str
    description: str
    status: str = "active"
    source_type: str = "manual"
    tasks: list[TaskItem] | None = None

class TaskUpdate(BaseModel):
    status: str | None = None
    priority: str | None = None
    position: int | None = None
    is_completed: bool | None = None

# Create a new project (optionally with tasks)
@app.post("/api/projects", response_model=dict)
async def create_project(
    project_data: ProjectCreate,
    supabase: Client = Depends(get_authenticated_supabase)
):
    """
    Create a new project. If tasks are provided, they are created too.
    """
    try:
        # Get the authenticated user ID from the token
        user_response = supabase.auth.get_user()
        user_id = user_response.user.id

        # Insert project
        project_payload = {
            "user_id": user_id,
            "title": project_data.title,
            "description": project_data.description,
            "status": project_data.status,
            "source_type": project_data.source_type,
            "updated_at": datetime.utcnow().isoformat()
        }
        project_result = supabase.table("projects").insert(project_payload).execute()
        if not project_result.data:
            raise HTTPException(status_code=500, detail="Failed to create project")
        project = project_result.data[0]

        # Insert tasks if provided
        if project_data.tasks:
            tasks_payload = []
            for idx, task in enumerate(project_data.tasks):
                tasks_payload.append({
                    "project_id": project["id"],
                    "title": task.title,
                    "description": task.description,
                    "priority": task.priority.lower(),
                    "position": idx,
                    "created_by": "llm" if project_data.source_type == "ai_generated" else "manual",
                    "status": "todo",
                    "is_completed": False
                })
            if tasks_payload:
                supabase.table("tasks").insert(tasks_payload).execute()

        return {
            "success": True,
            "project": project
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Get a project with its tasks
@app.get("/api/projects/{project_id}")
async def get_project_with_tasks(
    project_id: str,
    supabase: Client = Depends(get_authenticated_supabase)
):
    """
    Get a single project with all its tasks.
    """
    try:
        # Get project
        project = supabase.table("projects")\
            .select("*")\
            .eq("id", project_id)\
            .single()\
            .execute()
        if not project.data:
            raise HTTPException(status_code=404, detail="Project not found")

        # Get tasks
        tasks = supabase.table("tasks")\
            .select("*")\
            .eq("project_id", project_id)\
            .order("position", desc=False)\
            .execute()

        return {
            "success": True,
            "project": project.data,
            "tasks": tasks.data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Update a task
@app.patch("/api/tasks/{task_id}")
async def update_task(
    task_id: str,
    updates: TaskUpdate,
    supabase: Client = Depends(get_authenticated_supabase)
):
    """
    Update task fields (status, priority, position, etc.)
    """
    try:
        # First verify that the task belongs to the current user (via project)
        task = supabase.table("tasks")\
            .select("project_id")\
            .eq("id", task_id)\
            .single()\
            .execute()
        if not task.data:
            raise HTTPException(status_code=404, detail="Task not found")

        # Check project ownership
        project = supabase.table("projects")\
            .select("user_id")\
            .eq("id", task.data["project_id"])\
            .single()\
            .execute()
        user_response = supabase.auth.get_user()
        if project.data["user_id"] != user_response.user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this task")

        # Prepare update data (only send non-None fields)
        update_payload = {k: v for k, v in updates.dict().items() if v is not None}
        update_payload["updated_at"] = datetime.utcnow().isoformat()

        result = supabase.table("tasks")\
            .update(update_payload)\
            .eq("id", task_id)\
            .execute()

        return {
            "success": True,
            "task": result.data[0] if result.data else None
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Delete a task
@app.delete("/api/tasks/{task_id}")
async def delete_task(
    task_id: str,
    supabase: Client = Depends(get_authenticated_supabase)
):
    """
    Delete a task.
    """
    try:
        # Verify ownership (similar to update)
        task = supabase.table("tasks")\
            .select("project_id")\
            .eq("id", task_id)\
            .single()\
            .execute()
        if not task.data:
            raise HTTPException(status_code=404, detail="Task not found")

        project = supabase.table("projects")\
            .select("user_id")\
            .eq("id", task.data["project_id"])\
            .single()\
            .execute()
        user_response = supabase.auth.get_user()
        if project.data["user_id"] != user_response.user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this task")

        supabase.table("tasks").delete().eq("id", task_id).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/projects/{project_id}")
async def delete_project(
    project_id: str,
    supabase: Client = Depends(get_authenticated_supabase)
):
    """
    Delete a project and all its tasks (cascade will handle tasks).
    """
    try:
        # Verify ownership
        user_response = supabase.auth.get_user()
        user_id = user_response.user.id

        # Check if project exists and belongs to user
        project = supabase.table("projects")\
            .select("user_id")\
            .eq("id", project_id)\
            .single()\
            .execute()
        if not project.data:
            raise HTTPException(status_code=404, detail="Project not found")
        if project.data["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this project")

        # Delete project (cascade will delete tasks)
        supabase.table("projects").delete().eq("id", project_id).execute()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Add this model near the other models
class ChatRequest(BaseModel):
    message: str
    project_id: str

# Add the endpoint after the other routes
@app.post("/api/chat")
async def chat(
    request: ChatRequest,
    supabase: Client = Depends(get_authenticated_supabase)
):
    """
    Process a chat message: understand intent, modify tasks via database, return response and updated tasks.
    """
    try:
        # Get current tasks for the project
        tasks_result = supabase.table("tasks")\
            .select("*")\
            .eq("project_id", request.project_id)\
            .order("position", desc=False)\
            .execute()
        tasks_data = tasks_result.data

        # Build a map of task titles to IDs for reference (optional, but helps the model)
        task_map = {t["title"].lower(): t["id"] for t in tasks_data}

        # Build prompt for Gemini – be explicit about IDs
        prompt = f"""
You are an AI assistant for a task management app. The user is currently viewing a project with the following tasks:

{json.dumps(tasks_data, indent=2)}

The user says: "{request.message}"

Your job is to interpret the user's request and modify the task list accordingly. You can perform these actions:
- "add_task": add a new task. Provide "title", "description", "priority" (High/Medium/Low).
- "update_status": change a task's status. Provide "task_id" (the exact ID from the list) and "status" ("todo", "in-progress", "done").
- "delete_task": remove a task. Provide "task_id".
- "update_priority": change a task's priority. Provide "task_id" and "priority" (High/Medium/Low).

If the user refers to a task by its title, you must use the corresponding ID from the list above.

Return a JSON object with two fields:
- "response": a natural language response to the user.
- "actions": a list of action objects, each with "type" and the required fields.

Example:
{{
  "response": "I've added a new task 'Review code' with high priority.",
  "actions": [
    {{ "type": "add_task", "title": "Review code", "description": "Conduct code review of the latest PR", "priority": "high" }}
  ]
}}

If you cannot understand the request or there is no action to take, respond with a friendly message and an empty actions list.

Be precise with task IDs. Use only the IDs from the provided list.
"""

        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
        result = json.loads(text)

        # Process actions
        errors = []
        for action in result.get("actions", []):
            action_type = action.get("type")
            try:
                if action_type == "add_task":
                    # Insert new task
                    new_task = {
                        "project_id": request.project_id,
                        "title": action["title"],
                        "description": action.get("description", ""),
                        "priority": action.get("priority", "medium").lower(),
                        "status": "todo",
                        "is_completed": False,
                        "position": len(tasks_data),  # simple ordering
                        "created_by": "llm"
                    }
                    supabase.table("tasks").insert(new_task).execute()
                elif action_type == "update_status":
                    task_id = action["task_id"]
                    # Check that the task belongs to this project
                    existing = supabase.table("tasks").select("id").eq("id", task_id).eq("project_id", request.project_id).execute()
                    if not existing.data:
                        errors.append(f"Task with ID {task_id} not found in this project")
                        continue
                    supabase.table("tasks")\
                        .update({"status": action["status"]})\
                        .eq("id", task_id)\
                        .execute()
                elif action_type == "delete_task":
                    task_id = action["task_id"]
                    existing = supabase.table("tasks").select("id").eq("id", task_id).eq("project_id", request.project_id).execute()
                    if not existing.data:
                        errors.append(f"Task with ID {task_id} not found in this project")
                        continue
                    supabase.table("tasks").delete().eq("id", task_id).execute()
                elif action_type == "update_priority":
                    task_id = action["task_id"]
                    existing = supabase.table("tasks").select("id").eq("id", task_id).eq("project_id", request.project_id).execute()
                    if not existing.data:
                        errors.append(f"Task with ID {task_id} not found in this project")
                        continue
                    supabase.table("tasks")\
                        .update({"priority": action["priority"].lower()})\
                        .eq("id", task_id)\
                        .execute()
            except Exception as e:
                errors.append(f"Failed to execute action {action_type}: {str(e)}")

        # Fetch updated tasks
        updated_tasks = supabase.table("tasks")\
            .select("*")\
            .eq("project_id", request.project_id)\
            .order("position", desc=False)\
            .execute()

        response_text = result.get("response", "Done.")
        if errors:
            response_text += " " + "; ".join(errors)

        return {
            "success": True,
            "response": response_text,
            "tasks": updated_tasks.data
        }
    except json.JSONDecodeError as e:
        logging.exception("JSON decode error from Gemini")
        raise HTTPException(status_code=500, detail=f"AI response parsing failed: {str(e)}")
    except Exception as e:
        logging.exception("Chat error")
        raise HTTPException(status_code=500, detail=str(e))




if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)