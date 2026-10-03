import json
import time
import logging
from typing import Dict, Any, List, Optional
import anthropic

from config.claude_config import ANTHROPIC_API_KEY, CLAUDE_MODEL, MAX_TOKENS
from api.prompts import (
    CLAUDE_SYSTEM_PROMPT,
    GENERATE_QUESTION_USER_PROMPT,
    GENERATE_CHAIN_USER_PROMPT,
    GENERATE_VARIATIONS_USER_PROMPT
)

logger = logging.getLogger("a3t_generator")

_RESPONSE_CACHE: Dict[str, Any] = {}


def get_anthropic_client() -> anthropic.Anthropic:
    api_key = ANTHROPIC_API_KEY or "dummy_key"
    return anthropic.Anthropic(api_key=api_key)


def _call_claude_with_retry(
    system_prompt: str,
    user_prompt: str,
    max_retries: int = 3,
    initial_delay: float = 1.0
) -> str:
    """
    Calls Anthropic API with exponential backoff retry logic.
    Short-circuits immediately without retry on AuthenticationError or invalid key.
    """
    if not ANTHROPIC_API_KEY or ANTHROPIC_API_KEY == "dummy_key":
        raise anthropic.AuthenticationError(
            message="No valid ANTHROPIC_API_KEY set in environment.",
            response=None,
            body=None
        )

    client = get_anthropic_client()
    delay = initial_delay

    for attempt in range(1, max_retries + 1):
        try:
            logger.info(f"Calling Claude API (attempt {attempt}/{max_retries})...")
            response = client.messages.create(
                model=CLAUDE_MODEL,
                max_tokens=MAX_TOKENS,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}]
            )
            content = response.content[0].text
            logger.info("Successfully received response from Claude API.")
            return content
        except anthropic.AuthenticationError as auth_err:
            logger.error(f"Authentication error calling Claude API: {auth_err}")
            raise auth_err
        except anthropic.APIError as err:
            logger.error(f"Claude API error on attempt {attempt}: {err}")
            if attempt == max_retries:
                raise err
            time.sleep(delay)
            delay *= 2
        except Exception as e:
            logger.error(f"Unexpected error calling Claude API: {e}")
            if attempt == max_retries:
                raise e
            time.sleep(delay)
            delay *= 2

    raise RuntimeError("Failed to obtain response from Claude API.")


def _parse_json_response(content: str) -> Dict[str, Any]:
    """
    Parses raw text response from Claude into JSON dict. Handles markdown code blocks.
    """
    cleaned = content.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    return json.loads(cleaned)


def generate_single_question(
    topic: str,
    domain: str = "Video Games",
    difficulty: str = "Fan (Level 2)",
    count: int = 1
) -> Dict[str, Any]:
    """
    Generate single or multiple trivia questions for a topic.
    """
    cache_key = f"gen_single:{topic}:{domain}:{difficulty}:{count}"
    if cache_key in _RESPONSE_CACHE:
        logger.info(f"Cache hit for key: {cache_key}")
        return _RESPONSE_CACHE[cache_key]

    user_prompt = GENERATE_QUESTION_USER_PROMPT.format(
        topic=topic,
        domain=domain,
        difficulty=difficulty,
        count=count
    )

    try:
        raw_text = _call_claude_with_retry(CLAUDE_SYSTEM_PROMPT, user_prompt)
        parsed = _parse_json_response(raw_text)
        result = {
            "success": True,
            "questions": parsed.get("questions", [])
        }
        _RESPONSE_CACHE[cache_key] = result
        return result
    except Exception as e:
        logger.error(f"Error in generate_single_question: {e}")
        return {
            "success": False,
            "error": str(e),
            "questions": []
        }


def generate_question_chain(
    theme: str,
    length: int = 3,
    domains: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Generate a linked question chain around a theme.
    """
    if domains is None:
        domains = ["Video Games", "Animation", "Pro Wrestling"]

    cache_key = f"gen_chain:{theme}:{length}:{','.join(domains)}"
    if cache_key in _RESPONSE_CACHE:
        return _RESPONSE_CACHE[cache_key]

    user_prompt = GENERATE_CHAIN_USER_PROMPT.format(
        theme=theme,
        length=length,
        domains=", ".join(domains)
    )

    try:
        raw_text = _call_claude_with_retry(CLAUDE_SYSTEM_PROMPT, user_prompt)
        parsed = _parse_json_response(raw_text)
        result = {
            "success": True,
            "chain_theme": parsed.get("chain_theme", theme),
            "chain_validity": parsed.get("chain_validity", 0.85),
            "chain_questions": parsed.get("chain_questions", [])
        }
        _RESPONSE_CACHE[cache_key] = result
        return result
    except Exception as e:
        logger.error(f"Error in generate_question_chain: {e}")
        return {
            "success": False,
            "error": str(e),
            "chain_questions": []
        }


def generate_variations(
    base_question: str,
    base_answer: str
) -> Dict[str, Any]:
    """
    Generate 4 difficulty variations (Casual -> Expert) for a base question.
    """
    cache_key = f"gen_var:{base_question}:{base_answer}"
    if cache_key in _RESPONSE_CACHE:
        return _RESPONSE_CACHE[cache_key]

    user_prompt = GENERATE_VARIATIONS_USER_PROMPT.format(
        base_question=base_question,
        base_answer=base_answer
    )

    try:
        raw_text = _call_claude_with_retry(CLAUDE_SYSTEM_PROMPT, user_prompt)
        parsed = _parse_json_response(raw_text)
        result = {
            "success": True,
            "variations": parsed.get("variations", [])
        }
        _RESPONSE_CACHE[cache_key] = result
        return result
    except Exception as e:
        logger.error(f"Error in generate_variations: {e}")
        return {
            "success": False,
            "error": str(e),
            "variations": []
        }
