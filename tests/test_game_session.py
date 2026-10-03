import pytest
from uuid import UUID
from fastapi.testclient import TestClient

from src.mcp_server import app
from src.game_manager import game_manager

client = TestClient(app)


def test_create_game_session():
    response = client.post("/api/games", json={
        "host_name": "Alice",
        "deck_id": "uk-invasion-01",
        "max_players": 8
    })
    assert response.status_code == 200
    data = response.json()
    assert "game_id" in data
    assert "pin" in data
    assert len(data["pin"]) == 6
    assert data["status"] == "waiting"

    # Verify UUID format
    game_id_uuid = UUID(data["game_id"])
    assert game_id_uuid is not None


def test_join_game_session_by_pin():
    # First create a game
    create_res = client.post("/api/games", json={
        "host_name": "HostPlayer",
        "deck_id": "uk-invasion-01"
    })
    create_data = create_res.json()
    pin = create_data["pin"]
    game_id = create_data["game_id"]

    # Join game using PIN
    join_res = client.post(f"/api/games/{pin}/join", json={
        "player_name": "Bob"
    })
    assert join_res.status_code == 200
    join_data = join_res.json()
    assert "player_id" in join_data
    assert join_data["status"] == "joined"

    # Get game state and verify both players exist
    state_res = client.get(f"/api/games/{game_id}")
    assert state_res.status_code == 200
    state_data = state_res.json()
    assert len(state_data["players"]) == 2
    player_names = [p["name"] for p in state_data["players"]]
    assert "HostPlayer" in player_names
    assert "Bob" in player_names


def test_next_question_and_submit_answer():
    # Create game
    create_data = client.post("/api/games", json={
        "host_name": "HostPlayer",
        "deck_id": "uk-invasion-01"
    }).json()
    game_id = create_data["game_id"]

    # Get host player id
    state_data = client.get(f"/api/games/{game_id}").json()
    host_player = state_data["players"][0]
    host_player_id = host_player["id"]

    # Advance to next question
    next_res = client.post(f"/api/games/{game_id}/next-question")
    assert next_res.status_code == 200
    q_data = next_res.json()
    assert "question_id" in q_data
    assert "question" in q_data
    assert "category" in q_data

    # Submit answer
    answer_res = client.post(f"/api/games/{game_id}/answer", json={
        "player_id": host_player_id,
        "question_id": q_data["question_id"],
        "answer": "Some Answer",
        "time_taken": 4
    })
    assert answer_res.status_code == 200
    ans_data = answer_res.json()
    assert "is_correct" in ans_data
    assert "points_awarded" in ans_data


def test_leaderboard_end_game_and_history():
    # Create game and join a player
    create_data = client.post("/api/games", json={
        "host_name": "PlayerOne",
        "deck_id": "uk-invasion-01"
    }).json()
    game_id = create_data["game_id"]

    # Advance question
    q_data = client.post(f"/api/games/{game_id}/next-question").json()

    # Get state to find player_id
    state_data = client.get(f"/api/games/{game_id}").json()
    p1_id = state_data["players"][0]["id"]

    # Submit correct answer (Slaghoople or sample fallback)
    target_q = game_manager.game_questions[UUID(game_id)][0]
    correct_ans = target_q.answer

    client.post(f"/api/games/{game_id}/answer", json={
        "player_id": p1_id,
        "question_id": q_data["question_id"],
        "answer": correct_ans,
        "time_taken": 3
    })

    # Get Leaderboard
    leaderboard_res = client.get(f"/api/games/{game_id}/leaderboard")
    assert leaderboard_res.status_code == 200
    board = leaderboard_res.json()
    assert len(board) >= 1
    assert board[0]["score"] > 0
    assert board[0]["correct_answers"] == 1

    # End Game
    end_res = client.post(f"/api/games/{game_id}/end")
    assert end_res.status_code == 200
    end_data = end_res.json()
    assert "winner" in end_data
    assert "final_scores" in end_data

    # Retrieve History
    hist_res = client.get(f"/api/games/{game_id}/history")
    assert hist_res.status_code == 200
    hist_data = hist_res.json()
    assert hist_data["game_id"] == game_id
    assert len(hist_data["answers"]) == 1


def test_websocket_realtime_events():
    create_data = client.post("/api/games", json={
        "host_name": "HostPlayer",
        "deck_id": "uk-invasion-01"
    }).json()
    game_id = create_data["game_id"]

    with client.websocket_connect(f"/ws/games/{game_id}") as websocket:
        # Join a second player via HTTP
        client.post(f"/api/games/{game_id}/join", json={
            "player_name": "PlayerTwo"
        })

        # Receive WS message for player_joined
        msg = websocket.receive_json()
        assert msg["event"] == "player_joined"
        assert msg["data"]["player_name"] == "PlayerTwo"

        # Advance question via HTTP
        client.post(f"/api/games/{game_id}/next-question")

        # Receive WS message for question_advanced
        msg2 = websocket.receive_json()
        assert msg2["event"] == "question_advanced"
        assert "question_id" in msg2["data"]


def test_game_not_found_errors():
    fake_id = "00000000-0000-0000-0000-000000000000"
    res = client.get(f"/api/games/{fake_id}")
    assert res.status_code == 404

    res2 = client.post(f"/api/games/{fake_id}/join", json={"player_name": "Dave"})
    assert res2.status_code == 400
