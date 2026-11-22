from src import question_source
from src.question_source import load_questions, row_to_question
import pytest
from fastapi.testclient import TestClient

from api.app import app
from src.game_manager import GameManager, is_safety_checked


def _db_row(**overrides):
    row = {
        "id": "Q-0021",
        "deck_theme": None,
        "sequence": None,
        "category": "Video Games",
        "difficulty": "Hardcore (Level 3)",
        "question_type": "List Question",
        "question": "Name three Legend of Zelda games where Ganon is NOT the primary antagonist?",
        "answer": "Zelda II, Link's Awakening, Majora's Mask",
        "link": None,
        "notes": None,
        "connection_type": None,
        "franchise": None,
        "status": "Draft",
        "safety_checks_passed": False,
        "sub_theme": None,
        "readiness_status": "Needs Safety Check",
        "primary_pillar": "Video Games",
        "sheet_row": 22,
    }
    row.update(overrides)
    return row


def test_row_to_question_uses_sheet_headers():
    q = row_to_question(_db_row())
    assert q["ID"] == "Q-0021"
    assert q["Category / Domain"] == "Video Games"
    assert q["Question Type"] == "List Question"
    assert q["Deck / Theme"] == ""
    assert q["Safety Checks Passed"] == "FALSE"
    assert q["Primary Pillar"] == "Video Games"
    assert q["_row_number"] == 22
    assert q["parsed_answers"] == ["Zelda II", "Link's Awakening", "Majora's Mask"]


def test_row_to_question_standard_answer():
    q = row_to_question(_db_row(question_type="Standard", answer="Slaghoople",
                                safety_checks_passed=True))
    assert q["parsed_answers"] == ["Slaghoople"]
    assert q["Safety Checks Passed"] == "TRUE"


def test_row_to_question_missing_answer():
    q = row_to_question(_db_row(question_type="Standard", answer=None))
    assert q["Answer"] == ""
    assert q["parsed_answers"] == []


def test_load_questions_prefers_database(monkeypatch):
    monkeypatch.setattr(question_source, "load_questions_from_db",
                        lambda: [row_to_question(_db_row())])
    monkeypatch.setattr(question_source, "load_questions_from_csv",
                        lambda: [{"Question": "from csv"}])
    assert [q["ID"] for q in load_questions()] == ["Q-0021"]


def test_load_questions_falls_back_to_csv_when_db_fails(monkeypatch):
    def boom():
        raise RuntimeError("connection refused")
    monkeypatch.setattr(question_source, "load_questions_from_db", boom)
    monkeypatch.setattr(question_source, "load_questions_from_csv",
                        lambda: [{"Question": "from csv"}])
    assert load_questions() == [{"Question": "from csv"}]


def test_load_questions_falls_back_to_csv_when_table_empty(monkeypatch):
    monkeypatch.setattr(question_source, "load_questions_from_db", lambda: [])
    monkeypatch.setattr(question_source, "load_questions_from_csv",
                        lambda: [{"Question": "from csv"}])
    assert load_questions() == [{"Question": "from csv"}]


def test_game_uses_database_questions(monkeypatch):
    monkeypatch.setattr(question_source, "load_questions_from_db", lambda: [
        row_to_question(_db_row(deck_theme="Sample Chain", question="Who voices the Genie?",
                                answer="Robin Williams", question_type="Standard",
                                category="Animation", difficulty="Casual (Level 1)",
                                safety_checks_passed=True)),
        row_to_question(_db_row(safety_checks_passed=True)),
    ])
    questions = GameManager()._load_questions_for_deck("Sample Chain")
    assert [q.question for q in questions] == ["Who voices the Genie?"]
    assert questions[0].answer == "Robin Williams"
    assert questions[0].category == "Animation"


def test_game_skips_unanswered_questions(monkeypatch):
    monkeypatch.setattr(question_source, "load_questions_from_db", lambda: [
        row_to_question(_db_row(id="Q-0001", question="Answered?", answer="Yes",
                                question_type="Standard", safety_checks_passed=True)),
        row_to_question(_db_row(id="Q-0024", question="Who did John Cena defeat?",
                                answer=None, question_type="Standard",
                                safety_checks_passed=True)),
        row_to_question(_db_row(id="Q-0025", question="Blank answer?", answer="   ",
                                question_type="Standard", safety_checks_passed=True)),
    ])
    questions = GameManager()._load_questions_for_deck("all")
    assert [q.question for q in questions] == ["Answered?"]
    assert [q.id for q in questions] == [1]


def test_game_skips_questions_without_safety_checks(monkeypatch):
    monkeypatch.setattr(question_source, "load_questions_from_db", lambda: [
        row_to_question(_db_row(id="Q-0001", question="Checked?", answer="Yes",
                                question_type="Standard", safety_checks_passed=True)),
        row_to_question(_db_row(id="Q-0002", question="Not checked?", answer="Yes",
                                question_type="Standard", safety_checks_passed=False)),
    ])
    questions = GameManager()._load_questions_for_deck("all")
    assert [q.question for q in questions] == ["Checked?"]


def test_game_needs_at_least_one_safety_checked_question(monkeypatch):
    monkeypatch.setattr(question_source, "load_questions_from_db", lambda: [
        row_to_question(_db_row(safety_checks_passed=False)),
    ])
    with pytest.raises(ValueError, match="No safety-checked questions"):
        GameManager()._load_questions_for_deck("all")


def test_create_game_api_refuses_without_safety_checked_questions(monkeypatch):
    monkeypatch.setattr(question_source, "load_questions_from_db", lambda: [
        row_to_question(_db_row(safety_checks_passed=False)),
    ])
    res = TestClient(app).post("/api/games", json={"host_name": "Eve", "deck_id": "all"})
    assert res.status_code == 400
    assert res.json()["detail"] == "No safety-checked questions available for this deck."


@pytest.mark.parametrize("value,expected", [
    (True, True), (False, False), ("TRUE", True), ("true", True), (" TRUE ", True),
    ("FALSE", False), ("", False), (None, False),
])
def test_is_safety_checked(value, expected):
    assert is_safety_checked({"Safety Checks Passed": value}) is expected
