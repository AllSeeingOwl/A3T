import logging
from typing import List, Union
from uuid import UUID

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect

from src.game_models import (
    GameSession,
    Leaderboard,
    CreateGameRequest,
    CreateGameResponse,
    JoinGameRequest,
    JoinGameResponse,
    SubmitAnswerRequest,
    SubmitAnswerResponse,
    NextQuestionResponse,
    EndGameResponse,
    GameHistoryResponse,
)
from src.game_manager import game_manager
from src.websocket_manager import manager

logger = logging.getLogger("a3t_games_router")

router = APIRouter(prefix="/api/games", tags=["games"])


@router.post("", response_model=CreateGameResponse)
def create_game(payload: CreateGameRequest):
    session = game_manager.create_game(
        host_name=payload.host_name,
        deck_id=payload.deck_id,
        max_players=payload.max_players or 8
    )
    return CreateGameResponse(
        game_id=session.id,
        pin=session.pin,
        status=session.status
    )


@router.post("/{game_id}/join", response_model=JoinGameResponse)
async def join_game(game_id: str, payload: JoinGameRequest):
    try:
        session, player = game_manager.join_game(
            game_id_or_pin=game_id,
            player_name=payload.player_name,
            team_id=payload.team_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Broadcast player_joined event
    await manager.broadcast_to_game(
        game_id=str(session.id),
        event="player_joined",
        data={
            "player_id": str(player.id),
            "player_name": player.name,
            "team_id": str(player.team_id),
            "is_host": player.is_host
        }
    )

    return JoinGameResponse(
        player_id=player.id,
        status="joined"
    )


@router.get("/{game_id}", response_model=GameSession)
def get_game_state(game_id: str):
    session = game_manager.get_game(game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")
    return session


@router.post("/{game_id}/answer", response_model=SubmitAnswerResponse)
async def submit_answer(game_id: str, payload: SubmitAnswerRequest):
    session = game_manager.get_game(game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    try:
        answer_obj, is_correct, points = game_manager.submit_answer(
            game_id=session.id,
            player_id=payload.player_id,
            question_id=payload.question_id,
            answer_text=payload.answer,
            time_taken=payload.time_taken
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Broadcast score_updated event
    await manager.broadcast_to_game(
        game_id=str(session.id),
        event="score_updated",
        data={
            "player_id": str(payload.player_id),
            "question_id": payload.question_id,
            "is_correct": is_correct,
            "points_awarded": points,
            "scores": session.scores
        }
    )

    return SubmitAnswerResponse(
        is_correct=is_correct,
        points_awarded=points
    )


@router.post("/{game_id}/next-question", response_model=NextQuestionResponse)
async def next_question(game_id: str):
    session = game_manager.get_game(game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    try:
        question = game_manager.next_question(session.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Broadcast question_advanced event
    await manager.broadcast_to_game(
        game_id=str(session.id),
        event="question_advanced",
        data={
            "question_id": question.id,
            "question": question.question,
            "category": question.category,
            "difficulty": question.difficulty
        }
    )

    return NextQuestionResponse(
        question_id=question.id,
        question=question.question,
        category=question.category
    )


@router.get("/{game_id}/leaderboard", response_model=List[Leaderboard])
def get_leaderboard(game_id: str):
    session = game_manager.get_game(game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    try:
        return game_manager.get_leaderboard(session.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{game_id}/end", response_model=EndGameResponse)
async def end_game(game_id: str):
    session = game_manager.get_game(game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    try:
        winner, final_scores = game_manager.end_game(session.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return EndGameResponse(
        winner=winner,
        final_scores=final_scores
    )


@router.get("/{game_id}/history", response_model=GameHistoryResponse)
def get_game_history(game_id: str):
    session = game_manager.get_game(game_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    try:
        history = game_manager.get_history(session.id)
        return GameHistoryResponse(
            game_id=history["game_id"],
            created_at=history["created_at"],
            answers=history["answers"]
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# WebSocket endpoint
ws_router = APIRouter(tags=["websockets"])


@ws_router.websocket("/ws/games/{game_id}")
async def websocket_game_endpoint(websocket: WebSocket, game_id: str):
    # Retrieve game session to ensure valid ID / PIN
    session = game_manager.get_game(game_id)
    game_room_id = str(session.id) if session else game_id

    await manager.connect(websocket, game_room_id)
    try:
        while True:
            # Keep WebSocket connection open and listen for client messages
            data = await websocket.receive_text()
            logger.debug("Received WS message in room %s: %s", game_room_id, data)
    except WebSocketDisconnect:
        manager.disconnect(websocket, game_room_id)
        await manager.broadcast_to_game(
            game_id=game_room_id,
            event="player_left",
            data={"message": "A player disconnected"}
        )
