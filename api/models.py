import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from api.db import Base

class GameDB(Base):
    __tablename__ = "games"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    host_id = Column(String(36), nullable=False)
    deck_id = Column(String(255), nullable=False)
    pin = Column(String(6), unique=True, nullable=False)
    status = Column(String(50), nullable=False, default="lobby")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class PlayerDB(Base):
    __tablename__ = "players"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id = Column(String(36), ForeignKey("games.id"), nullable=False)
    name = Column(String(255), nullable=False)
    is_host = Column(Boolean, default=False)
    score = Column(Integer, default=0)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AnswerDB(Base):
    __tablename__ = "answers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    game_id = Column(String(36), ForeignKey("games.id"), nullable=False)
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    question_id = Column(String(255), nullable=False)
    answer_text = Column(String, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    points = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
