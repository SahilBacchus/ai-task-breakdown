# Backend (server side)

## Tech Stack 
- FastAPI
- Gemini API

## Setup

### 1. Get a Gemini API key
Get your API key from [Google AI Studio](https://aistudio.google.com/welcome)

steps: 
- Get Started -> Sign up/in
- Click "Get API Key"
- Create and copy your key

### 2. Configure Enviroment Variable 
Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. Install Dependencies 

```bash
pip install -r requirements.txt
```

### 4, Run the Server 
```bash
python main.py
```
note: going to localhost:8000/docs gives you a nice UI to test the endpoints

## API Endpoints 

### GET /health
Check if the server is running.

**Example Response:**
```json
{
  "status": "online",
  "message": "AI Task Breakdown backend is running",
  "version": "1.0.0"
}
```

### POST /generate-tasks
Generate actionable tasks from a project description

**Request Body:**
```json
{
  "description": "Build a simple weather app using React"
}

```

**Example Response:**
```json
{
  "tasks": [
    {
      "title": "Set up project environment",
      "description": "Initialize a new React project using Vite or Create React App and install necessary dependencies like axios.",
      "priority": "High"
    },
    {
      "title": "Obtain weather API key",
      "description": "Sign up for a weather API service (e.g., OpenWeatherMap) and generate an API key for data retrieval.",
      "priority": "High"
    },
    {
      "title": "Create basic UI layout",
      "description": "Develop the main component structure including an input field for city search and a container for weather display.",
      "priority": "Medium"
    },
    
    ...

  ]
}