import json
import logging
import os
import sys
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from mcp.server.mcpserver import MCPServer

from src.csv_parser import load_questions_from_csv, parse_csv_content
from src.validators import (
    validate_question as val_q,
    check_duplicates as chk_dup,
    analyze_difficulty as anz_diff,
    check_safety as chk_safe,
    generate_draft as gen_draft,
    list_themes as lst_themes,
    find_questions_by_domain as find_domain,
    validate_chain as val_chain
)

# Set up logging to logs/mcp_server.log
LOG_DIR = os.path.join(os.path.dirname(__file__), "..", "logs")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "mcp_server.log")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stderr)
    ]
)
logger = logging.getLogger("a3t_mcp_server")
logger.info("Initializing A3T Question Validator MCP Server...")

# Initialize MCP Server
mcp_server = MCPServer(
    name="A3T Question Validator MCP Server",
    version="1.0.0",
    description="MCP Server for validating, analyzing, and managing trivia questions in the A3T repository."
)

# Initialize FastAPI app for HTTP server capability
app = FastAPI(
    title="A3T Question Validator API",
    description="HTTP API and MCP Server for A3T Trivia Questions and Multiplayer Session Management",
    version="1.0.0"
)

# Import and include multiplayer game routers
from src.routers.games import router as games_router, ws_router
app.include_router(games_router)
app.include_router(ws_router)

# ---------------------------------------------------------------------------
# MCP Tool Declarations
# ---------------------------------------------------------------------------

@mcp_server.tool()
def validate_question(question: Dict[str, Any]) -> Dict[str, Any]:
    """
    Check CSV schema compliance and safety rules for a single question dictionary.
    """
    logger.info("Tool called: validate_question")
    try:
        result = val_q(question)
        logger.info("validate_question result: success=%s", result["success"])
        return result
    except Exception as e:
        logger.error("Error in validate_question: %s", str(e), exc_info=True)
        return {
            "success": False,
            "message": f"An error occurred during validation: {str(e)}",
            "data": {},
            "violations": ["Internal processing error."],
            "suggestions": ["Check question dict format and required keys."]
        }


@mcp_server.tool()
def check_duplicates(question_text: str, threshold: int = 80) -> Dict[str, Any]:
    """
    Find similar questions in the CSV database using fuzzy matching (fuzzywuzzy).
    """
    logger.info("Tool called: check_duplicates (threshold=%d)", threshold)
    try:
        db = load_questions_from_csv()
        result = chk_dup(question_text, db, threshold=threshold)
        logger.info("check_duplicates found %d matches", result["data"]["duplicate_count"])
        return result
    except Exception as e:
        logger.error("Error in check_duplicates: %s", str(e), exc_info=True)
        return {
            "success": False,
            "message": f"Error executing duplicate check: {str(e)}",
            "data": {},
            "violations": ["Failed to process duplicate check."],
            "suggestions": []
        }


@mcp_server.tool()
def analyze_difficulty(questions: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Calculate difficulty balance (20/40/30/10 target) across provided questions or full CSV dataset.
    """
    logger.info("Tool called: analyze_difficulty")
    try:
        dataset = questions if questions is not None else load_questions_from_csv()
        result = anz_diff(dataset)
        logger.info("analyze_difficulty completed for %d questions", len(dataset))
        return result
    except Exception as e:
        logger.error("Error in analyze_difficulty: %s", str(e), exc_info=True)
        return {
            "success": False,
            "message": f"Error analyzing difficulty: {str(e)}",
            "data": {},
            "violations": ["Failed to analyze difficulty."],
            "suggestions": []
        }


@mcp_server.tool()
def check_safety(target: Any) -> Dict[str, Any]:
    """
    Verify all 9 Safety Checks from docs/Question-Writer-Guidelines.md for a single question dict or a list of questions (deck).
    """
    logger.info("Tool called: check_safety")
    try:
        if isinstance(target, str):
            # Try parsing if JSON string passed
            try:
                target = json.loads(target)
            except Exception:
                pass
        result = chk_safe(target)
        logger.info("check_safety result: success=%s", result["success"])
        return result
    except Exception as e:
        logger.error("Error in check_safety: %s", str(e), exc_info=True)
        return {
            "success": False,
            "message": f"Error running safety checks: {str(e)}",
            "data": {},
            "violations": ["Safety check execution error."],
            "suggestions": []
        }


@mcp_server.tool()
def generate_draft(topic: str, category: str = "Video Games", difficulty: str = "Fan (Level 2)") -> Dict[str, Any]:
    """
    Create a question scaffold/draft from topic, category, and difficulty.
    """
    logger.info("Tool called: generate_draft (topic='%s', category='%s')", topic, category)
    try:
        result = gen_draft(topic, category, difficulty)
        return result
    except Exception as e:
        logger.error("Error in generate_draft: %s", str(e), exc_info=True)
        return {
            "success": False,
            "message": f"Error generating draft: {str(e)}",
            "data": {},
            "violations": [],
            "suggestions": []
        }


@mcp_server.tool()
def list_themes() -> Dict[str, Any]:
    """
    Show all available themes and sub-themes from Question-Writer-Guidelines.
    """
    logger.info("Tool called: list_themes")
    try:
        return lst_themes()
    except Exception as e:
        logger.error("Error in list_themes: %s", str(e), exc_info=True)
        return {
            "success": False,
            "message": f"Error listing themes: {str(e)}",
            "data": {},
            "violations": [],
            "suggestions": []
        }


@mcp_server.tool()
def find_questions_by_domain(domain: str) -> Dict[str, Any]:
    """
    Filter trivia questions by domain (Animation / Video Games / Pro Wrestling).
    """
    logger.info("Tool called: find_questions_by_domain (domain='%s')", domain)
    try:
        db = load_questions_from_csv()
        result = find_domain(domain, db)
        logger.info("find_questions_by_domain matched %d questions", result["data"]["count"])
        return result
    except Exception as e:
        logger.error("Error in find_questions_by_domain: %s", str(e), exc_info=True)
        return {
            "success": False,
            "message": f"Error finding questions: {str(e)}",
            "data": {},
            "violations": [],
            "suggestions": []
        }


@mcp_server.tool()
def validate_chain(questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Check if 3 linked questions form a valid chain (sequence, category flow, link integrity, safety).
    """
    logger.info("Tool called: validate_chain")
    try:
        result = val_chain(questions)
        logger.info("validate_chain result: success=%s", result["success"])
        return result
    except Exception as e:
        logger.error("Error in validate_chain: %s", str(e), exc_info=True)
        return {
            "success": False,
            "message": f"Error validating chain: {str(e)}",
            "data": {},
            "violations": ["Chain validation execution error."],
            "suggestions": []
        }


# ---------------------------------------------------------------------------
# FastAPI HTTP Endpoints
# ---------------------------------------------------------------------------

class QuestionModel(BaseModel):
    question: Dict[str, Any]

class CheckDuplicatesModel(BaseModel):
    question_text: str
    threshold: int = 80

class CheckSafetyModel(BaseModel):
    target: Any

class DraftModel(BaseModel):
    topic: str
    category: str = "Video Games"
    difficulty: str = "Fan (Level 2)"

class DomainModel(BaseModel):
    domain: str

class ChainModel(BaseModel):
    questions: List[Dict[str, Any]]


@app.get("/health")
def health_check():
    return {"status": "ok", "server": "A3T Question Validator MCP Server"}

@app.post("/api/validate_question")
def api_validate_question(payload: QuestionModel):
    return validate_question(payload.question)

@app.post("/api/check_duplicates")
def api_check_duplicates(payload: CheckDuplicatesModel):
    return check_duplicates(payload.question_text, payload.threshold)

@app.get("/api/analyze_difficulty")
def api_analyze_difficulty():
    return analyze_difficulty()

@app.post("/api/check_safety")
def api_check_safety(payload: CheckSafetyModel):
    return check_safety(payload.target)

@app.post("/api/generate_draft")
def api_generate_draft(payload: DraftModel):
    return generate_draft(payload.topic, payload.category, payload.difficulty)

@app.get("/api/list_themes")
def api_list_themes():
    return list_themes()

@app.post("/api/find_questions_by_domain")
def api_find_questions_by_domain(payload: DomainModel):
    return find_questions_by_domain(payload.domain)

@app.post("/api/validate_chain")
def api_validate_chain(payload: ChainModel):
    return validate_chain(payload.questions)


def run_stdio():
    logger.info("Starting MCP server in STDIO mode...")
    mcp_server.run(transport="stdio")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--http":
        import uvicorn
        logger.info("Starting FastAPI HTTP server on port 8000...")
        uvicorn.run("src.mcp_server:app", host="0.0.0.0", port=8000, reload=False)
    else:
        run_stdio()
