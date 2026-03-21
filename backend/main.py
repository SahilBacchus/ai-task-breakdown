import os
import json
import re
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi.middleware.cors import CORSMiddleware

# Setup & Config
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-3.1-flash-lite-preview')

app = FastAPI(title="AI Task Breakdown API")

# CORS (allow frontend dev server)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class ProjectInput(BaseModel):
    title: str
    description: str

# Health Endpoint
@app.get("/health")
async def health_check():
    """
    Standard health check to verify the server is up and reachable
    """
    return {
        "status": "online",
        "message": "AI Task Breakdown backend is running",
        "version": "1.0.0"
    }

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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)