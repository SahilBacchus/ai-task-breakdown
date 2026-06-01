# tests/test_generate_tasks.py
import json
import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app

def test_generate_tasks_success():
    """Test /generate-tasks with a valid AI response."""
    client = TestClient(app)
    fake_tasks = [
        {
            "title": "Setup project",
            "description": "Initialize repo and install deps",
            "priority": "High",
            "estimatedTime": "1h"
        },
        {
            "title": "Write tests",
            "description": "Add unit tests for core logic",
            "priority": "Medium",
            "estimatedTime": "2h"
        }
    ]
    fake_response_text = json.dumps(fake_tasks)

    with patch("main.model.generate_content") as mock_generate:
        mock_response = MagicMock()
        mock_response.text = fake_response_text
        mock_generate.return_value = mock_response

        response = client.post(
            "/generate-tasks",
            json={"title": "Test Project", "description": "Some description"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data
        assert data["tasks"] == fake_tasks


def test_generate_tasks_invalid_json():
    """Test when AI returns malformed JSON."""
    client = TestClient(app)
    with patch("main.model.generate_content") as mock_generate:
        mock_response = MagicMock()
        mock_response.text = "This is not JSON"
        mock_generate.return_value = mock_response

        response = client.post(
            "/generate-tasks",
            json={"title": "Test", "description": "desc"}
        )
        assert response.status_code == 500
        assert response.json()["detail"] == "AI returned invalid JSON format"


def test_generate_tasks_missing_fields():
    """Test when AI returns JSON missing required fields."""
    client = TestClient(app)
    fake_tasks = [{"title": "Only title", "description": "desc"}]  # missing priority
    fake_response_text = json.dumps(fake_tasks)

    with patch("main.model.generate_content") as mock_generate:
        mock_response = MagicMock()
        mock_response.text = fake_response_text
        mock_generate.return_value = mock_response

        response = client.post(
            "/generate-tasks",
            json={"title": "Test", "description": "desc"}
        )
        assert response.status_code == 500
        assert response.json()["detail"] == "Missing required field in task"