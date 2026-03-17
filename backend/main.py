import os
import json
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

# CORS stuff
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Later we might eventually want to replace with our frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data Models
class ProjectDescription(BaseModel):
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
async def generate_tasks(project: ProjectDescription):
    '''
    Breaks down the given description into a list of actionable tasks 
    and returns json array with the tasks
    '''
    prompt = f"""
    Break down the following project description into a list of specific, actionable tasks.
    Return the result strictly as a valid JSON array of objects.
    Each object must have the keys: "title", "description", and "priority" (High, Medium, or Low).
    
    Project Description: {project.description}
    """

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Helper to strip markdown formatting if Gemini includes it
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
            
        tasks = json.loads(text)
        return {"tasks": tasks}
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid JSON format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)