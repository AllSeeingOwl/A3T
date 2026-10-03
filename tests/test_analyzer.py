import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from api.analyzer import (
    analyze_single_question,
    analyze_csv_dataset,
    validate_question_chain
)
from src.mcp_server import app

client = TestClient(app)


def test_analyze_single_question_fallback():
    res = analyze_single_question(
        question="In the Tekken series, which character wears a jaguar mask?",
        answer="King",
        domain="Video Games"
    )
    assert res["success"] is True
    assert "safety_analysis" in res
    assert "quality_score" in res


@patch("api.analyzer._call_claude_with_retry")
def test_analyze_single_question_mocked(mock_claude):
    mock_claude.return_value = '{"safety_analysis": {"passed_checks": 8, "failed_checks": [1], "violations": ["Medium not specified"]}, "difficulty_estimate": "Fan (Level 2)", "quality_score": 0.85, "suggestions": ["Add medium spec"], "can_improve": true}'
    res = analyze_single_question(
        question="In Tekken, who wears a jaguar mask?",
        answer="King",
        domain="Video Games"
    )
    assert res["success"] is True
    assert res["quality_score"] == 0.85
    assert res["safety_analysis"]["passed_checks"] == 8


def test_analyze_csv_dataset_default():
    res = analyze_csv_dataset()
    assert res["success"] is True
    assert "total_questions" in res
    assert "stats" in res
    assert "recommendations" in res


def test_api_analyze_question_endpoint():
    response = client.post(
        "/api/analyze/question",
        json={
            "question": "In Tekken, which character wears a jaguar mask?",
            "answer": "King",
            "domain": "Video Games"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "safety_analysis" in data


def test_api_analyze_csv_endpoint():
    response = client.post(
        "/api/analyze/csv",
        json={}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "total_questions" in data


def test_api_validate_chain_endpoint():
    response = client.post(
        "/api/validate/chain",
        json={
            "questions": [
                "In Tekken, which character wears a jaguar mask?",
                "Which animated series featured Tekken characters?",
                "Who runs the UpUpDownDown gaming channel?"
            ],
            "answers": [
                "King",
                "Street Fighter X Tekken: The Animation",
                "Xavier Woods"
            ],
            "links": [
                "King's wrestling moves connect to Street Fighter's crossover...",
                "Xavier Woods from New Day runs the gaming channel..."
            ]
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "chain_valid" in data
