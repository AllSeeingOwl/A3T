import pytest

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "1.0.0"

def test_create_and_get_game(client):
    create_res = client.post("/api/games", json={
        "host_name": "TestHost",
        "deck_id": "test_deck",
        "max_players": 4
    })
    assert create_res.status_code == 200
    game_data = create_res.json()
    assert "game_id" in game_data
    assert "pin" in game_data

    game_id = game_data["game_id"]
    get_res = client.get(f"/api/games/{game_id}")
    assert get_res.status_code == 200
    res_json = get_res.json()
    assert res_json["deck_id"] == "test_deck"
    assert len(res_json["players"]) == 1
    assert res_json["players"][0]["name"] == "TestHost"
