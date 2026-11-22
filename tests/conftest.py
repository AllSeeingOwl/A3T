import pytest
from fastapi.testclient import TestClient
from api.app import app

from src import question_source

# Safety-checked questions that every test game uses unless a test patches
# question_source.load_questions_from_db itself. They are all in the "test_deck"
# deck, so tests can create games with deck_id "test_deck" or "all".
SAMPLE_QUESTION_ROWS = [
    {"deck_theme": "test_deck", "id": "T-0001", "category": "Animation", "difficulty": "Fan (Level 2)",
     "question_type": "Standard", "question": "What is Wilma Flintstone's maiden name?",
     "answer": "Slaghoople", "safety_checks_passed": True, "sheet_row": 2},
    {"deck_theme": "test_deck", "id": "T-0002", "category": "Video Games", "difficulty": "Casual (Level 1)",
     "question_type": "List Question", "question": "Name the four ghosts from Pac-Man.",
     "answer": "Blinky, Pinky, Inky, Clyde", "safety_checks_passed": True, "sheet_row": 3},
    {"deck_theme": "test_deck", "id": "T-0003", "category": "Pro Wrestling", "difficulty": "Casual (Level 1)",
     "question_type": "Standard", "question": "Who was the WWE Champion in 2024?",
     "answer": "Cody Rhodes", "safety_checks_passed": True, "sheet_row": 4},
]


@pytest.fixture(autouse=True)
def sample_questions(monkeypatch):
    """Serve game questions from a fixed set instead of a real database."""
    monkeypatch.setattr(question_source, "load_questions_from_db", lambda: [
        question_source.row_to_question(dict(row)) for row in SAMPLE_QUESTION_ROWS
    ])


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client
