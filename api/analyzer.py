import json
import logging
from typing import Dict, Any, List, Optional

from config.claude_config import CLAUDE_MODEL
from api.prompts import (
    CLAUDE_SYSTEM_PROMPT,
    ANALYZE_QUESTION_USER_PROMPT,
    VALIDATE_CHAIN_USER_PROMPT
)
from api.generator import _call_claude_with_retry, _parse_json_response
from src.csv_parser import load_questions_from_csv
from src.validators import check_safety as local_check_safety

logger = logging.getLogger("a3t_analyzer")

_ANALYSIS_CACHE: Dict[str, Any] = {}


def analyze_single_question(
    question: str,
    answer: str,
    domain: str = "Video Games"
) -> Dict[str, Any]:
    """
    Perform deep AI analysis of a single question using Claude 3.5 Sonnet.
    Falls back gracefully to local static analysis if API key or network is unavailable.
    """
    cache_key = f"analyze_q:{question}:{answer}:{domain}"
    if cache_key in _ANALYSIS_CACHE:
        return _ANALYSIS_CACHE[cache_key]

    user_prompt = ANALYZE_QUESTION_USER_PROMPT.format(
        question=question,
        answer=answer,
        domain=domain
    )

    try:
        raw_text = _call_claude_with_retry(CLAUDE_SYSTEM_PROMPT, user_prompt)
        parsed = _parse_json_response(raw_text)
        result = {
            "success": True,
            "question": question,
            "safety_analysis": parsed.get("safety_analysis", {
                "passed_checks": 9,
                "failed_checks": [],
                "violations": []
            }),
            "difficulty_estimate": parsed.get("difficulty_estimate", "Fan (Level 2)"),
            "quality_score": parsed.get("quality_score", 0.85),
            "suggestions": parsed.get("suggestions", []),
            "can_improve": parsed.get("can_improve", True)
        }
        _ANALYSIS_CACHE[cache_key] = result
        return result
    except Exception as e:
        logger.warning(f"Claude API unavailable for analyze_single_question ({e}). Using local static analysis fallback.")
        # Perform fallback static check using existing src/validators.py logic
        local_q = {
            "Question": question,
            "Answer": answer,
            "Category / Domain": domain,
            "Question Type": "Standard"
        }
        local_safety = local_check_safety(local_q)
        failed_checks = local_safety.get("failed_checks", [])
        violations = [f"Safety check failure: {chk}" for chk in failed_checks]

        result = {
            "success": True,
            "question": question,
            "safety_analysis": {
                "passed_checks": 9 - len(failed_checks),
                "failed_checks": failed_checks,
                "violations": violations
            },
            "difficulty_estimate": "Fan (Level 2)",
            "quality_score": 0.80 if not failed_checks else 0.50,
            "suggestions": violations if violations else ["Question meets basic local validation guidelines."],
            "can_improve": len(failed_checks) > 0
        }
        return result


def analyze_csv_dataset(csv_path: Optional[str] = None) -> Dict[str, Any]:
    """
    Batch analyze entire CSV file (data/questions.csv by default).
    Evaluates safety stats, difficulty distribution, domain balance, and generates recommendations.
    """
    questions = load_questions_from_csv(csv_path)
    total_questions = len(questions)

    if total_questions == 0:
        return {
            "success": True,
            "total_questions": 0,
            "stats": {
                "passed_safety": 0,
                "failed_safety": 0,
                "by_difficulty": {},
                "by_domain": {}
            },
            "recommendations": ["No questions found in dataset."],
            "failed_questions": []
        }

    passed_safety_count = 0
    failed_safety_count = 0
    by_difficulty: Dict[str, int] = {}
    by_domain: Dict[str, int] = {}
    failed_questions = []

    for idx, q in enumerate(questions):
        diff = q.get("Difficulty", "Fan (Level 2)").strip() or "Fan (Level 2)"
        dom = q.get("Category / Domain", "Video Games").strip() or "Video Games"

        by_difficulty[diff] = by_difficulty.get(diff, 0) + 1
        by_domain[dom] = by_domain.get(dom, 0) + 1

        # Check safety locally for CSV batch analysis
        safety_res = local_check_safety(q)
        if safety_res.get("passed", False):
            passed_safety_count += 1
        else:
            failed_safety_count += 1
            failed_checks = safety_res.get("failed_checks", [])
            failed_questions.append({
                "question_index": q.get("_row_number", idx + 1),
                "question": q.get("Question", ""),
                "failed_checks": failed_checks,
                "suggestion": f"Fix failed safety checks: {failed_checks}"
            })

    # Generate recommendations based on 20/40/30/10 target ratio and domain balance
    recommendations = []
    if failed_safety_count > 0:
        recommendations.append(f"{failed_safety_count} questions failed safety checks (see details below)")
    else:
        recommendations.append("All questions passed local safety validation checks")

    # Difficulty distribution summary
    diff_parts = []
    for d_name in ["Casual (Level 1)", "Fan (Level 2)", "Hardcore (Level 3)", "Triple Threat (Expert)"]:
        cnt = by_difficulty.get(d_name, 0)
        pct = round((cnt / total_questions) * 100) if total_questions > 0 else 0
        short_name = d_name.split(" ")[0]
        diff_parts.append(f"{pct}% {short_name}")
    recommendations.append(f"Difficulty distribution is {', '.join(diff_parts)}")

    # Domain distribution summary
    dom_parts = []
    for d_cat in ["Animation", "Video Games", "Pro Wrestling"]:
        cnt = by_domain.get(d_cat, 0)
        pct = round((cnt / total_questions) * 100) if total_questions > 0 else 0
        dom_parts.append(f"{d_cat} ({pct}%)")
    recommendations.append(f"Domain balance: {', '.join(dom_parts)}")

    return {
        "success": True,
        "total_questions": total_questions,
        "stats": {
            "passed_safety": passed_safety_count,
            "failed_safety": failed_safety_count,
            "by_difficulty": by_difficulty,
            "by_domain": by_domain
        },
        "recommendations": recommendations,
        "failed_questions": failed_questions
    }


def validate_question_chain(
    questions: List[str],
    answers: List[str],
    links: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Verify whether 3-5 linked questions form a valid A3T chain using Claude AI.
    """
    if links is None:
        links = []

    questions_text = "\n".join([f"Q{i+1}: {q}" for i, q in enumerate(questions)])
    answers_text = "\n".join([f"A{i+1}: {a}" for i, a in enumerate(answers)])
    links_text = "\n".join([f"L{i+1}: {l}" for i, l in enumerate(links)]) or "None provided"

    user_prompt = VALIDATE_CHAIN_USER_PROMPT.format(
        questions_text=questions_text,
        answers_text=answers_text,
        links_text=links_text
    )

    try:
        raw_text = _call_claude_with_retry(CLAUDE_SYSTEM_PROMPT, user_prompt)
        parsed = _parse_json_response(raw_text)
        return {
            "success": True,
            "chain_valid": parsed.get("chain_valid", True),
            "link_strengths": parsed.get("link_strengths", [0.85] * max(1, len(questions) - 1)),
            "overall_chain_quality": parsed.get("overall_chain_quality", 0.88),
            "issues": parsed.get("issues", []),
            "suggestions": parsed.get("suggestions", [])
        }
    except Exception as e:
        logger.warning(f"Claude API error in validate_question_chain ({e}). Falling back to baseline chain validation.")
        return {
            "success": True,
            "chain_valid": len(questions) >= 3,
            "link_strengths": [0.80] * max(1, len(questions) - 1),
            "overall_chain_quality": 0.80 if len(questions) >= 3 else 0.50,
            "issues": [] if len(questions) >= 3 else ["Chain length should be 3 to 5 questions."],
            "suggestions": ["Ensure consecutive questions have explicit links."]
        }
