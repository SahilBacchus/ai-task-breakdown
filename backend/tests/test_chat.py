# tests/test_chat.py
import json
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from main import app

# Dummy JWT (structure is valid enough to avoid index errors)
DUMMY_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

def test_chat_add_task():
    """Test chat endpoint adding a task."""
    mock_supabase_client = MagicMock()

    # Initial tasks fetch
    mock_supabase_client.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = [
        {"id": "task1", "title": "Write documentation", "project_id": "proj123"}
    ]

    # Mock auth
    mock_user = MagicMock()
    mock_user.id = "user123"
    mock_supabase_client.auth.get_user.return_value = mock_user
    mock_supabase_client.auth.set_session = MagicMock()

    fake_ai_response = {
        "response": "Added a new task 'Review PR'.",
        "actions": [{"type": "add_task", "title": "Review PR", "description": "Check the pull request", "priority": "high"}]
    }

    with patch("main.create_client", return_value=mock_supabase_client), \
         patch("main.model.generate_content") as mock_generate:
        mock_response = MagicMock()
        mock_response.text = json.dumps(fake_ai_response)
        mock_generate.return_value = mock_response

        client = TestClient(app)
        response = client.post(
            "/api/chat",
            json={"message": "Add a task to review PR", "project_id": "proj123"},
            headers={"Authorization": f"Bearer {DUMMY_JWT}"}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "Added a new task" in data["response"]

    mock_supabase_client.table.assert_called_with("tasks")
    mock_supabase_client.table.return_value.insert.assert_called_once()
    insert_args = mock_supabase_client.table.return_value.insert.call_args[0][0]
    assert insert_args["title"] == "Review PR"


def test_chat_update_status():
    """Test chat endpoint updating a task's status."""
    mock_supabase_client = MagicMock()

    # Initial tasks fetch (uses .order().execute())
    mock_supabase_client.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = [
        {"id": "task1", "title": "Write documentation", "project_id": "proj123", "status": "todo"}
    ]

    # Existence check inside action loop (uses .execute() directly, no .order)
    # This is a separate call; we set it on the same eq mock without breaking the chain above.
    mock_supabase_client.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [{"id": "task1"}]

    mock_user = MagicMock()
    mock_user.id = "user123"
    mock_supabase_client.auth.get_user.return_value = mock_user
    mock_supabase_client.auth.set_session = MagicMock()

    fake_ai_response = {
        "response": "Marked task 'Write documentation' as done.",
        "actions": [{"type": "update_status", "task_id": "task1", "status": "done"}]
    }

    with patch("main.create_client", return_value=mock_supabase_client), \
         patch("main.model.generate_content") as mock_generate:
        mock_response = MagicMock()
        mock_response.text = json.dumps(fake_ai_response)
        mock_generate.return_value = mock_response

        client = TestClient(app)
        response = client.post(
            "/api/chat",
            json={"message": "Mark documentation as done", "project_id": "proj123"},
            headers={"Authorization": f"Bearer {DUMMY_JWT}"}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True

    mock_supabase_client.table.return_value.update.assert_called()
    update_call = mock_supabase_client.table.return_value.update.call_args[0][0]
    assert update_call["status"] == "done"


def test_chat_no_action():
    """Test chat when AI returns no actions (just a response)."""
    mock_supabase_client = MagicMock()

    mock_supabase_client.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value.data = [
        {"id": "task1", "title": "Write documentation", "project_id": "proj123"}
    ]

    mock_user = MagicMock()
    mock_user.id = "user123"
    mock_supabase_client.auth.get_user.return_value = mock_user
    mock_supabase_client.auth.set_session = MagicMock()

    fake_ai_response = {
        "response": "I'm sorry, I didn't understand that.",
        "actions": []
    }

    with patch("main.create_client", return_value=mock_supabase_client), \
         patch("main.model.generate_content") as mock_generate:
        mock_response = MagicMock()
        mock_response.text = json.dumps(fake_ai_response)
        mock_generate.return_value = mock_response

        client = TestClient(app)
        response = client.post(
            "/api/chat",
            json={"message": "Hello", "project_id": "proj123"},
            headers={"Authorization": f"Bearer {DUMMY_JWT}"}
        )

    assert response.status_code == 200
    data = response.json()
    assert data["response"] == "I'm sorry, I didn't understand that."
    assert len(data["tasks"]) == 1