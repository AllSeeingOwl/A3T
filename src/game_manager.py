import json
import os
import random
import string
import logging
from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Union, Any

from fuzzywuzzy import fuzz

from src.game_models import (
    Player, Question, Answer, GameSession, Leaderboard, get_utc_now
)
from src.csv_parser import load_questions_from_csv

logger = logging.getLogger("a3t_game_manager")


class GameManager:
    def __init__(self):
        self.sessions: Dict[UUID, GameSession] = {}
        self.pin_to_id: Dict[str, UUID] = {}
        self.game_questions: Dict[UUID, List[Question]] = {}
        self.game_answers: Dict[UUID, List[Answer]] = {}

    def generate_pin(self) -> str:
        """Generate a unique 6-character uppercase alphanumeric PIN."""
        while True:
            pin = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if pin not in self.pin_to_id:
                return pin

    def _load_questions_for_deck(self, deck_id: str) -> List[Question]:
        """Load questions from CSV or fallback JSON data."""
        raw_questions = load_questions_from_csv()
        questions = []
        q_id = 1

        # Filter by deck_id if specified, or use available CSV questions
        for row in raw_questions:
            row_deck = row.get("Deck / Theme", "")
            if deck_id == "all" or not deck_id or row_deck.lower() == deck_id.lower() or not raw_questions:
                q = Question(
                    id=q_id,
                    deck_id=deck_id,
                    category=row.get("Category / Domain") or "General",
                    question=row.get("Question") or "Sample Question",
                    answer=row.get("Answer") or "Sample Answer",
                    difficulty=row.get("Difficulty") or "Casual (Level 1)"
                )
                questions.append(q)
                q_id += 1

        # If CSV gave no matching questions, supply fallback sample questions
        if not questions:
            fallback_data = [
                {"category": "Animation", "question": "What is Wilma Flintstone's maiden name?", "answer": "Slaghoople", "difficulty": "Fan (Level 2)"},
                {"category": "Video Games", "question": "Name the four ghosts from Pac-Man.", "answer": "Blinky, Pinky, Inky, Clyde", "difficulty": "Casual (Level 1)"},
                {"category": "Pro Wrestling", "question": "Who was the WWE Champion in 2024?", "answer": "Cody Rhodes", "difficulty": "Casual (Level 1)"}
            ]
            for idx, item in enumerate(fallback_data, start=1):
                questions.append(Question(
                    id=idx,
                    deck_id=deck_id,
                    category=item["category"],
                    question=item["question"],
                    answer=item["answer"],
                    difficulty=item["difficulty"]
                ))

        return questions

    def create_game(self, host_name: str, deck_id: str, max_players: int = 8) -> GameSession:
        game_id = uuid4()
        pin = self.generate_pin()
        host_team_id = uuid4()

        host_player = Player(
            name=host_name,
            team_id=host_team_id,
            is_host=True
        )

        questions = self._load_questions_for_deck(deck_id)
        self.game_questions[game_id] = questions
        self.game_answers[game_id] = []

        session = GameSession(
            id=game_id,
            host_id=host_player.id,
            deck_id=deck_id,
            pin=pin,
            status="waiting",
            players=[host_player],
            current_question_index=0,
            scores={str(host_team_id): 0},
            created_at=get_utc_now(),
            updated_at=get_utc_now()
        )

        self.sessions[game_id] = session
        self.pin_to_id[pin] = game_id
        return session

    def get_game(self, game_id_or_pin: Union[UUID, str]) -> Optional[GameSession]:
        if isinstance(game_id_or_pin, UUID):
            return self.sessions.get(game_id_or_pin)

        # Check if UUID string
        try:
            val_uuid = UUID(str(game_id_or_pin))
            if val_uuid in self.sessions:
                return self.sessions[val_uuid]
        except ValueError:
            pass

        # Check if PIN string
        pin_upper = str(game_id_or_pin).upper()
        if pin_upper in self.pin_to_id:
            return self.sessions.get(self.pin_to_id[pin_upper])

        return None

    def join_game(
        self,
        game_id_or_pin: Union[UUID, str],
        player_name: str,
        team_id: Optional[Union[UUID, str]] = None
    ) -> Tuple[GameSession, Player]:
        session = self.get_game(game_id_or_pin)
        if not session:
            raise ValueError("Game session not found.")

        if session.status == "completed":
            raise ValueError("Cannot join a completed game.")

        if isinstance(team_id, str):
            try:
                parsed_team_id = UUID(team_id)
            except ValueError:
                parsed_team_id = uuid4()
        elif isinstance(team_id, UUID):
            parsed_team_id = team_id
        else:
            parsed_team_id = uuid4()

        player = Player(
            name=player_name,
            team_id=parsed_team_id,
            is_host=False
        )

        session.players.append(player)
        team_key = str(parsed_team_id)
        if team_key not in session.scores:
            session.scores[team_key] = 0

        session.updated_at = get_utc_now()
        return session, player

    def normalize_str(self, text: str) -> str:
        cleaned = "".join(c.lower() for c in text if c.isalnum() or c.isspace())
        return " ".join(cleaned.split())

    def submit_answer(
        self,
        game_id: UUID,
        player_id: UUID,
        question_id: int,
        answer_text: str,
        time_taken: int
    ) -> Tuple[Answer, bool, int]:
        session = self.sessions.get(game_id)
        if not session:
            raise ValueError("Game session not found.")

        # Find player
        player = next((p for p in session.players if p.id == player_id), None)
        if not player:
            raise ValueError("Player not found in this game.")

        # Find question
        questions = self.game_questions.get(game_id, [])
        question = next((q for q in questions if q.id == question_id), None)
        if not question:
            # Fallback to current question if available
            if 0 <= session.current_question_index < len(questions):
                question = questions[session.current_question_index]
            else:
                raise ValueError("Question not found.")

        # Evaluate correctness
        norm_submitted = self.normalize_str(answer_text)
        norm_expected = self.normalize_str(question.answer)

        is_correct = False
        if norm_submitted and norm_expected:
            if norm_submitted in norm_expected or norm_expected in norm_submitted:
                is_correct = True
            elif fuzz.ratio(norm_submitted, norm_expected) >= 80:
                is_correct = True

        points = 0
        if is_correct:
            points = 10
            # Speed bonus
            if time_taken <= 5:
                points += 5
            elif time_taken <= 10:
                points += 2

        team_key = str(player.team_id)
        session.scores[team_key] = session.scores.get(team_key, 0) + points

        answer_obj = Answer(
            game_id=game_id,
            player_id=player_id,
            question_id=question.id,
            submitted_answer=answer_text,
            is_correct=is_correct,
            points_awarded=points,
            time_taken=time_taken,
            submitted_at=get_utc_now()
        )

        self.game_answers[game_id].append(answer_obj)
        session.updated_at = get_utc_now()

        return answer_obj, is_correct, points

    def next_question(self, game_id: UUID) -> Question:
        session = self.sessions.get(game_id)
        if not session:
            raise ValueError("Game session not found.")

        questions = self.game_questions.get(game_id, [])
        if not questions:
            raise ValueError("No questions available for this game.")

        if session.status == "waiting":
            session.status = "in_progress"
            session.current_question_index = 0
        else:
            if session.current_question_index < len(questions) - 1:
                session.current_question_index += 1
            else:
                session.status = "completed"

        session.updated_at = get_utc_now()
        return questions[session.current_question_index]

    def get_leaderboard(self, game_id: UUID) -> List[Leaderboard]:
        session = self.sessions.get(game_id)
        if not session:
            raise ValueError("Game session not found.")

        answers = self.game_answers.get(game_id, [])

        # Group stats by team
        team_stats: Dict[str, Dict[str, Any]] = {}

        # Populate teams from players
        for player in session.players:
            team_key = str(player.team_id)
            if team_key not in team_stats:
                team_stats[team_key] = {
                    "team_name": f"Team {player.name}" if len(session.players) > 1 else player.name,
                    "score": session.scores.get(team_key, 0),
                    "correct": 0,
                    "total": 0
                }

        # Calculate answers per player -> team
        player_to_team = {str(p.id): str(p.team_id) for p in session.players}
        for ans in answers:
            team_key = player_to_team.get(str(ans.player_id))
            if team_key and team_key in team_stats:
                team_stats[team_key]["total"] += 1
                if ans.is_correct:
                    team_stats[team_key]["correct"] += 1

        # Build list
        board_items = []
        for team_key, data in team_stats.items():
            tot = data["total"]
            corr = data["correct"]
            acc = round((corr / tot * 100.0), 1) if tot > 0 else 0.0
            board_items.append({
                "team_name": data["team_name"],
                "score": data["score"],
                "correct_answers": corr,
                "total_questions": tot,
                "accuracy": acc
            })

        # Sort by score descending, accuracy descending
        board_items.sort(key=lambda x: (x["score"], x["accuracy"]), reverse=True)

        leaderboard = []
        for idx, item in enumerate(board_items, start=1):
            leaderboard.append(Leaderboard(
                rank=idx,
                team_name=item["team_name"],
                score=item["score"],
                correct_answers=item["correct_answers"],
                total_questions=item["total_questions"],
                accuracy=item["accuracy"]
            ))

        return leaderboard

    def end_game(self, game_id: UUID) -> Tuple[str, List[Dict[str, Any]]]:
        session = self.sessions.get(game_id)
        if not session:
            raise ValueError("Game session not found.")

        session.status = "completed"
        session.updated_at = get_utc_now()

        leaderboard = self.get_leaderboard(game_id)
        winner = leaderboard[0].team_name if leaderboard else "No Winner"
        final_scores = [
            {"team_name": item.team_name, "score": item.score, "rank": item.rank}
            for item in leaderboard
        ]

        return winner, final_scores

    def get_history(self, game_id: UUID) -> Dict[str, Any]:
        session = self.sessions.get(game_id)
        if not session:
            raise ValueError("Game session not found.")

        answers = self.game_answers.get(game_id, [])
        return {
            "game_id": session.id,
            "created_at": session.created_at,
            "answers": answers
        }


game_manager = GameManager()
