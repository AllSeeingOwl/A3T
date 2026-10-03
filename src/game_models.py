from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import List, Dict, Optional, Any, Union
from pydantic import BaseModel, Field


def get_utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Player(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    team_id: UUID = Field(default_factory=uuid4)
    joined_at: datetime = Field(default_factory=get_utc_now)
    is_host: bool = False


class Question(BaseModel):
    id: int
    deck_id: str
    category: str
    question: str
    answer: str
    difficulty: str


class Answer(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    game_id: UUID
    player_id: UUID
    question_id: int
    submitted_answer: str
    is_correct: bool
    points_awarded: int
    time_taken: int
    submitted_at: datetime = Field(default_factory=get_utc_now)


class GameSession(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    host_id: UUID
    deck_id: str
    pin: str
    status: str = "waiting"
    players: List[Player] = []
    current_question_index: int = 0
    scores: Dict[str, int] = {}
    created_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)


class Leaderboard(BaseModel):
    rank: int
    team_name: str
    score: int
    correct_answers: int
    total_questions: int
    accuracy: float


# DTOs for Endpoints
class CreateGameRequest(BaseModel):
    host_name: str
    deck_id: str
    max_players: Optional[int] = 8


class CreateGameResponse(BaseModel):
    game_id: UUID
    pin: str
    status: str


class JoinGameRequest(BaseModel):
    player_name: str
    team_id: Optional[Union[UUID, str]] = None


class JoinGameResponse(BaseModel):
    player_id: UUID
    status: str


class SubmitAnswerRequest(BaseModel):
    player_id: UUID
    question_id: int
    answer: str
    time_taken: int


class SubmitAnswerResponse(BaseModel):
    is_correct: bool
    points_awarded: int


class NextQuestionResponse(BaseModel):
    question_id: int
    question: str
    category: str


class EndGameResponse(BaseModel):
    winner: str
    final_scores: List[Dict[str, Any]]


class GameHistoryResponse(BaseModel):
    game_id: UUID
    created_at: datetime
    answers: List[Answer]
