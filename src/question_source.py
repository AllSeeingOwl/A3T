"""
Question source for the game.

Questions live in the Supabase `questions` table, which is kept in sync with the
A3T-Q&A-Database Google Sheet (see scripts/sheets_sync/). This module reads that
table and returns rows in the same shape as src.csv_parser, keyed by the sheet's
column headers, so callers don't care where the questions came from.

If the database can't be reached or the table is empty, it falls back to
data/questions.csv so local development and tests keep working without a
database.
"""
import logging
from typing import Any, Dict, List

from sqlalchemy import text

from src.csv_parser import load_questions_from_csv, parse_list_answer

logger = logging.getLogger("a3t_question_source")

# Supabase column -> sheet header (the keys src.csv_parser produces).
COLUMN_TO_HEADER = {
    "id": "ID",
    "deck_theme": "Deck / Theme",
    "sequence": "Sequence / Q#",
    "category": "Category / Domain",
    "difficulty": "Difficulty",
    "question_type": "Question Type",
    "question": "Question",
    "answer": "Answer",
    "link": "The Link",
    "notes": "Notes / Hidden Chain",
    "connection_type": "Connection Type",
    "franchise": "Franchise / IP",
    "status": "Status / Playtested",
    "safety_checks_passed": "Safety Checks Passed",
    "sub_theme": "Sub-Theme",
    "readiness_status": "Readiness Status",
    "primary_pillar": "Primary Pillar",
}

_QUERY = text(
    "select " + ", ".join(COLUMN_TO_HEADER) + ", sheet_row "
    "from public.questions order by sheet_row nulls last, id"
)


def row_to_question(row: Dict[str, Any]) -> Dict[str, Any]:
    """Convert a `questions` table row into the csv_parser question shape."""
    q: Dict[str, Any] = {}
    for col, header in COLUMN_TO_HEADER.items():
        value = row.get(col)
        if col == "safety_checks_passed":
            q[header] = "TRUE" if value else "FALSE"
        else:
            q[header] = "" if value is None else str(value)
    q["_row_number"] = row.get("sheet_row")

    if q["Question Type"].lower() == "list question":
        q["parsed_answers"] = parse_list_answer(q["Answer"])
    else:
        q["parsed_answers"] = [q["Answer"]] if q["Answer"] else []
    return q


def load_questions_from_db() -> List[Dict[str, Any]]:
    """Read every question from the Supabase `questions` table."""
    # Imported here so importing this module never opens a connection.
    from api.db import engine

    with engine.connect() as conn:
        rows = conn.execute(_QUERY).mappings().all()
    return [row_to_question(dict(r)) for r in rows]


def load_questions() -> List[Dict[str, Any]]:
    """
    Load questions from Supabase, falling back to data/questions.csv if the
    database is unavailable or has no questions.
    """
    try:
        questions = load_questions_from_db()
        if questions:
            return questions
        logger.warning("questions table is empty; falling back to data/questions.csv")
    except Exception as e:
        logger.warning("Could not load questions from the database (%s); "
                       "falling back to data/questions.csv", e)
    return load_questions_from_csv()
