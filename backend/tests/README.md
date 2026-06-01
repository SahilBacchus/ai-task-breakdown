# Tests

This folder contains unit tests and quality evaluation tests for the AI Task Breakdown backend.

---

## Running Tests

All tests must be run from the `backend/` directory.  


Run all tests:

```bash
pytest
```

Run a specific test file:

```bash
pytest tests/test_health.py
```

Run with verbose output:

```bash
pytest -v
```

Show print statements (e.g., similarity scores):

```bash
pytest -s
```

---


## Test Files

| File | Description |
|------|-------------|
| `test_health.py` | Basic health check endpoint test |
| `test_generate_tasks.py` | Unit tests for task generation (mocked Gemini) |
| `test_chat.py` | End-to-end chat tests (mocked Supabase) |
| `test_task_generation_quality.py` | Quality evaluation using cosine similarity against a golden dataset (real API calls) |

---

## Notes

- The quality test calls the **real `/generate-tasks` endpoint** (no mocking).
  - Requires a valid `GEMINI_API_KEY`
  - Requires an active internet connection

- Mocked tests run fully offline and do not require external APIs or keys.

- The first run of the quality test will download the embedding model: `all-MiniLM-L6-v2` (~80MB)

---