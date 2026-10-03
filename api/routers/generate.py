from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from api.generator import (
    generate_single_question,
    generate_question_chain,
    generate_variations
)

router = APIRouter(prefix="/api/generate", tags=["Generation"])


class GenerateQuestionRequest(BaseModel):
    topic: str = Field(..., json_schema_extra={"example": "Tekken"})
    domain: str = Field(default="Video Games", json_schema_extra={"example": "Video Games"})
    difficulty: str = Field(default="Fan (Level 2)", json_schema_extra={"example": "Fan (Level 2)"})
    count: int = Field(default=1, ge=1, le=10, json_schema_extra={"example": 1})


class GenerateChainRequest(BaseModel):
    theme: str = Field(..., json_schema_extra={"example": "90s Nostalgia"})
    length: int = Field(default=3, ge=3, le=5, json_schema_extra={"example": 3})
    domains: Optional[List[str]] = Field(
        default=None,
        json_schema_extra={"example": ["Video Games", "Animation", "Pro Wrestling"]}
    )

    def __init__(self, **data):
        if "domains" not in data or data["domains"] is None:
            data["domains"] = ["Video Games", "Animation", "Pro Wrestling"]
        super().__init__(**data)


class GenerateVariationsRequest(BaseModel):
    base_question: str = Field(..., json_schema_extra={"example": "What is Tekken?"})
    base_answer: str = Field(..., json_schema_extra={"example": "A fighting video game series"})


@router.post("/question")
def api_generate_question(payload: GenerateQuestionRequest):
    result = generate_single_question(
        topic=payload.topic,
        domain=payload.domain,
        difficulty=payload.difficulty,
        count=payload.count
    )
    if not result.get("success") and "error" in result and "503" in result["error"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Claude API service unavailable"
        )
    return result


@router.post("/chain")
def api_generate_chain(payload: GenerateChainRequest):
    result = generate_question_chain(
        theme=payload.theme,
        length=payload.length,
        domains=payload.domains
    )
    if not result.get("success") and "error" in result and "503" in result["error"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Claude API service unavailable"
        )
    return result


@router.post("/variations")
def api_generate_variations(payload: GenerateVariationsRequest):
    result = generate_variations(
        base_question=payload.base_question,
        base_answer=payload.base_answer
    )
    if not result.get("success") and "error" in result and "503" in result["error"]:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Claude API service unavailable"
        )
    return result
