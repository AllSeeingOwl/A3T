import pytest
from fastapi.testclient import TestClient
from src.mcp_server import app

client = TestClient(app)

def test_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert "total_games" in data
    assert "total_players" in data
    assert "overall_accuracy" in data

def test_analytics_questions():
    response = client.get("/api/analytics/questions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        q = data[0]
        assert "question_id" in q
        assert "accuracy" in q
        assert "category" in q

def test_analytics_daily_stats():
    response = client.get("/api/analytics/daily-stats")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_analytics_player_leaderboard():
    response = client.get("/api/analytics/player-leaderboard?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

def test_analytics_category_breakdown():
    response = client.get("/api/analytics/category-breakdown")
    assert response.status_code == 200
    data = response.json()
    assert "Video Games" in data or "Animation" in data

def test_analytics_difficulty_breakdown():
    response = client.get("/api/analytics/difficulty-breakdown")
    assert response.status_code == 200
    data = response.json()
    assert "Casual" in data

def test_admin_authentication():
    resp_invalid = client.post("/api/admin/authenticate", json={"password": "wrong_password"})
    assert resp_invalid.status_code == 401

    resp_valid = client.post("/api/admin/authenticate", json={"password": "admin_password"})
    assert resp_valid.status_code == 200
    data = resp_valid.json()
    assert data["authenticated"] is True
    assert "token" in data

def test_admin_flag_and_hide_question():
    flag_resp = client.post("/api/admin/flag-question", json={
        "question_id": "q_001",
        "reason": "Test flag reason",
        "suggested_fix": "Fixed wording"
    })
    assert flag_resp.status_code == 200
    flag_data = flag_resp.json()
    assert flag_data["flagged"] is True

    get_flags_no_auth = client.get("/api/admin/flagged-questions")
    assert get_flags_no_auth.status_code == 401

    auth_resp = client.post("/api/admin/authenticate", json={"password": "admin_password"})
    token = auth_resp.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    get_flags_auth = client.get("/api/admin/flagged-questions", headers=headers)
    assert get_flags_auth.status_code == 200
    flags = get_flags_auth.json()
    assert any(f["question_id"] == "q_001" for f in flags)

    hide_resp = client.post("/api/admin/hide-question", json={
        "question_id": "q_001",
        "reason": "Moderated"
    }, headers=headers)
    assert hide_resp.status_code == 200
    assert hide_resp.json()["hidden"] is True

    unhide_resp = client.post("/api/admin/unhide-question", json={
        "question_id": "q_001"
    }, headers=headers)
    assert unhide_resp.status_code == 200
    assert unhide_resp.json()["hidden"] is False
