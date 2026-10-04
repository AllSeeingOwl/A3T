from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Header, status
from pydantic import BaseModel
from api.analytics_manager import analytics_manager

router = APIRouter(prefix="/api/admin", tags=["admin"])

class AuthRequest(BaseModel):
    password: str

class FlagQuestionRequest(BaseModel):
    question_id: str
    reason: str
    suggested_fix: Optional[str] = None
    flagged_by: Optional[str] = "Player"

class HideQuestionRequest(BaseModel):
    question_id: str
    reason: Optional[str] = ""

class UnhideQuestionRequest(BaseModel):
    question_id: str

def verify_admin_auth(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header"
        )
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Authorization token format"
        )
    token = parts[1]
    if not analytics_manager.verify_token(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired admin token"
        )

@router.post("/authenticate")
def authenticate(payload: AuthRequest):
    token = analytics_manager.authenticate_admin(payload.password)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid password"
        )
    return {"authenticated": True, "token": token}

@router.post("/flag-question")
def flag_question(payload: FlagQuestionRequest):
    record = analytics_manager.flag_question(
        question_id=payload.question_id,
        reason=payload.reason,
        suggested_fix=payload.suggested_fix,
        flagged_by=payload.flagged_by or "Player"
    )
    return {
        "flagged": True,
        "flag_id": record["flag_id"],
        "status": record["status"]
    }

@router.get("/flagged-questions", dependencies=[Depends(verify_admin_auth)])
def get_flagged_questions():
    return analytics_manager.get_flagged_questions()

@router.post("/hide-question", dependencies=[Depends(verify_admin_auth)])
def hide_question(payload: HideQuestionRequest):
    record = analytics_manager.hide_question(
        question_id=payload.question_id,
        reason=payload.reason or ""
    )
    return {
        "hidden": True,
        "hidden_at": record["hidden_at"]
    }

@router.post("/unhide-question", dependencies=[Depends(verify_admin_auth)])
def unhide_question(payload: UnhideQuestionRequest):
    unhidden = analytics_manager.unhide_question(payload.question_id)
    return {"hidden": not unhidden}
