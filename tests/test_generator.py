import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from api.generator import (
    generate_single_question,
    generate_question_chain,
    generate_variations,
    _parse_json_response,
    _call_claude_with_retry
)
from api.csv_handler import save_questions_to_csv
from src.mcp_server import app

client = TestClient(app)


def test_parse_json_response_clean():
    raw = '{"success": true, "questions": []}'
    parsed = _parse_json_response(raw)
    assert parsed == {"success": True, "questions": []}


def test_parse_json_response_markdown_codeblock():
    raw = '```json\n{"success": true, "value": 123}\n```'
    parsed = _parse_json_response(raw)
    assert parsed["value"] == 123


@patch("api.generator._call_claude_with_retry")
def test_generate_single_question_mocked(mock_claude):
    mock_claude.return_value = '{"questions": [{"question": "Q?", "answer": "A"}]}'
    res = generate_single_question(topic="Tekken", domain="Video Games")
    assert res["success"] is True
    assert len(res["questions"]) == 1
    assert res["questions"][0]["question"] == "Q?"


@patch("api.generator._call_claude_with_retry")
def test_generate_question_chain_mocked(mock_claude):
    mock_claude.return_value = '{"chain_theme": "Test Theme", "chain_validity": 0.9, "chain_questions": [{"question": "Q1"}]}'
    res = generate_question_chain(theme="Test Theme", length=3)
    assert res["success"] is True
    assert res["chain_theme"] == "Test Theme"
    assert len(res["chain_questions"]) == 1


@patch("api.generator._call_claude_with_retry")
def test_generate_variations_mocked(mock_claude):
    mock_claude.return_value = '{"variations": [{"difficulty": "Casual (Level 1)", "question": "Easy Q?"}]}'
    res = generate_variations(base_question="What is Tekken?", base_answer="A fighting game")
    assert res["success"] is True
    assert len(res["variations"]) == 1


def test_api_generate_question_endpoint():
    response = client.post(
        "/api/generate/question",
        json={
            "topic": "Tekken",
            "domain": "Video Games",
            "difficulty": "Fan (Level 2)",
            "count": 1
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "success" in data


def test_api_generate_chain_endpoint():
    response = client.post(
        "/api/generate/chain",
        json={
            "theme": "90s Nostalgia",
            "length": 3,
            "domains": ["Video Games", "Animation", "Pro Wrestling"]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "success" in data


def test_api_generate_variations_endpoint():
    response = client.post(
        "/api/generate/variations",
        json={
            "base_question": "What is Tekken?",
            "base_answer": "A fighting video game series"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "success" in data


def test_csv_handler_export(tmp_path):
    target_csv = tmp_path / "gen_test.csv"
    questions = [{
        "question": "Who is Mario?",
        "answer": "Plumber",
        "domain": "Video Games",
        "difficulty": "Casual (Level 1)"
    }]
    path_written = save_questions_to_csv(questions, str(target_csv))
    assert path_written == str(target_csv)
    with open(target_csv, "r", encoding="utf-8-sig") as f:
        content = f.read()
        assert "Who is Mario?" in content
        assert "Plumber" in content
