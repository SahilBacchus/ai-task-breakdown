# tests/test_task_generation_quality.py
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from fastapi.testclient import TestClient
from main import app



# ---------- Golden Dataset ----------
# This dataset represents the "ideal" output for two project descriptions. 
# Used as the benchmark for evaluating semantic similarity of generated tasks using embedding-based cosine similarity.
GOLDEN_SET = [
    {
        "title": "Blog Platform",
        "description": "Develop a blog platform with a rich text editor, post scheduling, categories and tags, comment system with moderation, user profiles, and SEO optimization features.",
        "expected_tasks": [
            {"title": "Database Schema Design", "description": "Design relational database schema for users, posts, comments, categories, and tags.", "priority": "High"},
            {"title": "Setup Backend Framework", "description": "Initialize server-side project structure with routing, database connection, and authentication middleware.", "priority": "High"},
            {"title": "User Authentication System", "description": "Implement user registration, login, JWT-based sessions, and profile management endpoints.", "priority": "High"},
            {"title": "Rich Text Editor Integration", "description": "Integrate a library like Quill or TipTap into the frontend for content creation.", "priority": "High"},
            {"title": "Post CRUD Implementation", "description": "Develop API endpoints for creating, reading, updating, and deleting blog posts with database integration.", "priority": "High"},
            {"title": "Post Scheduling Logic", "description": "Implement a background job or cron task to publish posts automatically based on a set timestamp.", "priority": "Medium"},
            {"title": "Taxonomy System", "description": "Develop category and tag management functionality, including associations with posts.", "priority": "Medium"},
            {"title": "Comment System with Moderation", "description": "Build comment submission API and an admin interface to approve, delete, or flag comments.", "priority": "Medium"},
            {"title": "SEO Optimization Features", "description": "Add dynamic meta tag injection, sitemap generation, and URL slug customization for better search engine ranking.", "priority": "Medium"},
            {"title": "User Profile UI", "description": "Develop frontend pages for users to edit their bio, avatar, and view their post history.", "priority": "Low"}
        ]
    },
    {
        "title": "Fitness Tracker",
        "description": "Design a fitness tracking application with workout logging, exercise library, progress charts and statistics, goal setting, meal planning integration, and social features for workout sharing.",
        "expected_tasks": [
            {"title": "Data Modeling", "description": "Design schema for users, workouts, exercises, meals, and social activity feeds.", "priority": "High"},
            {"title": "User Authentication", "description": "Setup secure user registration and login with profile initialization.", "priority": "High"},
            {"title": "Exercise Library Setup", "description": "Create a database of standard exercises with categories, equipment needs, and instructional data.", "priority": "High"},
            {"title": "Workout Logging Interface", "description": "Build an interface for users to input sets, reps, weights, and duration for their workouts.", "priority": "High"},
            {"title": "Goal Setting Module", "description": "Implement logic for users to set personal weight or performance goals and track completion.", "priority": "Medium"},
            {"title": "Meal Planning API", "description": "Integrate or build a meal tracking feature to log daily caloric and macronutrient intake.", "priority": "Medium"},
            {"title": "Progress Analytics Engine", "description": "Calculate fitness trends and generate data for progress charts (weight, strength over time).", "priority": "Medium"},
            {"title": "Dashboard Charts", "description": "Visualize workout progress and meal intake using frontend charting libraries.", "priority": "Medium"},
            {"title": "Social Activity Feed", "description": "Build a feed where users can see and like their friends' recent workout logs.", "priority": "Low"},
            {"title": "Social Sharing Logic", "description": "Implement functionality to share completed workouts to the platform feed or external social media.", "priority": "Low"}
        ]
    }
]



# ---------- Helper Functions ----------
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def get_embedding(text: str):
    """Get embedding vector using local sentence-transformers model."""
    return embedding_model.encode(text)

def compute_similarity(embedding1, embedding2):
    """Cosine similarity between two vectors."""
    emb1 = np.array(embedding1).reshape(1, -1)
    emb2 = np.array(embedding2).reshape(1, -1)
    return cosine_similarity(emb1, emb2)[0][0]

def get_task_text(task):
    """Combine title and description for embedding."""
    return f"{task['title']}. {task.get('description', '')}"

def match_tasks(expected_tasks, generated_tasks):
    """
    For each generated task, find the best matching expected task by cosine similarity.
    Returns average similarity and list of matches.
    """
    # Get embeddings for expected tasks
    expected_embeddings = []
    for exp in expected_tasks:
        text = get_task_text(exp)
        emb = get_embedding(text)
        expected_embeddings.append(emb)
    
    # For generated tasks, compute similarity to each expected and take max
    similarities = []
    for gen in generated_tasks:
        gen_text = get_task_text(gen)
        gen_emb = get_embedding(gen_text)
        sims = [compute_similarity(gen_emb, exp_emb) for exp_emb in expected_embeddings]
        best_sim = max(sims) if sims else 0.0
        similarities.append(best_sim)
    
    avg_sim = np.mean(similarities) if similarities else 0.0
    return avg_sim, similarities



# ---------- Test Logic ----------
def test_quality_cosine_similarity():
    """
    Test that AI-generated tasks are semantically similar to expected tasks.
    
    - Generate tasks from project requirements.
    - Compare outputs to a golden dataset using embedding-based cosine similarity.
    - Verify the overall average similarity exceeds the accepted threshold.
    """
    client = TestClient(app)
    SIMILARITY_THRESHOLD = 0.65  # Essentially the minimum closeness to our "golden dataset" that we want generation to be
    
    all_similarities = []
    for project in GOLDEN_SET:
        # Call the generate-tasks endpoint
        response = client.post(
            "/generate-tasks",
            json={"title": project["title"], "description": project["description"]}
        )
        assert response.status_code == 200
        data = response.json()
        generated_tasks = data["tasks"]
        
        # Compute similarity with expected tasks
        avg_sim, sims = match_tasks(project["expected_tasks"], generated_tasks)
        all_similarities.append(avg_sim)
        
        # Optionally log for debugging (when we do pytest -s)
        print(f"\nProject: {project['title']}")
        print(f"  Average similarity: {avg_sim:.3f}")
        print(f"  Per-task similarities: {[round(s,3) for s in sims]}")
    
    # Overall average across projects
    overall_avg = np.mean(all_similarities)
    print(f"\nOverall average cosine similarity: {overall_avg:.3f}")
    
    # Assert that quality is acceptable
    assert overall_avg >= SIMILARITY_THRESHOLD, f"Average similarity {overall_avg:.3f} below threshold {SIMILARITY_THRESHOLD}"

