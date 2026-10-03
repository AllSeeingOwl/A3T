from typing import List, Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

from api.analyzer import (
    analyze_single_question,
    analyze_csv_dataset,
    validate_question_chain
)

analyze_router = APIRouter(prefix="/api/analyze", tags=["Analysis"])
validate_router = APIRouter(prefix="/api/validate", tags=["Validation"])


class AnalyzeQuestionRequest(BaseModel):
    question: str = Field(..., json_schema_extra={"example": "In Tekken, which character wears a jaguar mask?"})
    answer: str = Field(..., json_schema_extra={"example": "King"})
    domain: str = Field(default="Video Games", json_schema_extra={"example": "Video Games"})


class AnalyzeCsvRequest(BaseModel):
    csv_path: Optional[str] = Field(default=None, json_schema_extra={"example": "data/questions.csv"})


class ValidateChainRequest(BaseModel):
    questions: List[str] = Field(..., json_schema_extra={"example": ["Q1", "Q2", "Q3"]})
    answers: List[str] = Field(..., json_schema_extra={"example": ["A1", "A2", "A3"]})
    links: Optional[List[str]] = Field(default=[], json_schema_extra={"example": ["Link 1", "Link 2"]})


@analyze_router.post("/question")
def api_analyze_question(payload: AnalyzeQuestionRequest):
    result = analyze_single_question(
        question=payload.question,
        answer=payload.answer,
        domain=payload.domain
    )
    return result


@analyze_router.post("/csv")
def api_analyze_csv(payload: Optional[AnalyzeCsvRequest] = None):
    csv_path = payload.csv_path if payload else None
    result = analyze_csv_dataset(csv_path=csv_path)
    return result


@validate_router.post("/chain")
def api_validate_chain(payload: ValidateChainRequest):
    result = validate_question_chain(
        questions=payload.questions,
        answers=payload.answers,
        links=payload.links
    )
    return result
