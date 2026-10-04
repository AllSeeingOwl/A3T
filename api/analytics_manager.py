import os
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Any, Optional
from uuid import uuid4
import jwt

SECRET_KEY = os.getenv("ADMIN_JWT_SECRET", "a3t-admin-secret-key-change-in-production")
ALGORITHM = "HS256"
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin_password")

class AnalyticsManager:
    def __init__(self):
        self.flags: Dict[str, Dict[str, Any]] = {}
        self.hidden_questions: Dict[str, Dict[str, Any]] = {}

    def authenticate_admin(self, password: str) -> Optional[str]:
        if password == ADMIN_PASSWORD:
            payload = {
                "sub": "admin",
                "exp": datetime.now(timezone.utc) + timedelta(hours=24)
            }
            return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
        return None

    def verify_token(self, token: str) -> bool:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload.get("sub") == "admin"
        except Exception:
            return False

    def flag_question(self, question_id: str, reason: str, suggested_fix: Optional[str] = None, flagged_by: str = "Player") -> Dict[str, Any]:
        flag_id = f"flag_{uuid4().hex[:8]}"
        flag_record = {
            "flag_id": flag_id,
            "question_id": question_id,
            "reason": reason,
            "suggested_fix": suggested_fix,
            "flagged_at": datetime.now(timezone.utc).isoformat(),
            "flagged_by": flagged_by,
            "status": "under_review"
        }
        self.flags[flag_id] = flag_record
        return flag_record

    def get_flagged_questions(self) -> List[Dict[str, Any]]:
        return list(self.flags.values())

    def hide_question(self, question_id: str, reason: str = "") -> Dict[str, Any]:
        now_str = datetime.now(timezone.utc).isoformat()
        record = {
            "question_id": question_id,
            "reason": reason,
            "hidden_at": now_str
        }
        self.hidden_questions[question_id] = record
        return record

    def unhide_question(self, question_id: str) -> bool:
        if question_id in self.hidden_questions:
            del self.hidden_questions[question_id]
            return True
        return False

    def is_hidden(self, question_id: str) -> bool:
        return question_id in self.hidden_questions

analytics_manager = AnalyticsManager()
