import re
from typing import List, Dict, Any, Optional, Tuple
from fuzzywuzzy import fuzz
from src.csv_parser import parse_list_answer

VALID_DOMAINS = {
    "Animation",
    "Video Games",
    "Pro Wrestling",
    "Video Games / Animation",
    "Animation / Video Games",
    "Pro Wrestling / Video Games",
    "Video Games / Pro Wrestling",
    "Animation / Pro Wrestling",
    "Pro Wrestling / Animation"
}

VALID_DIFFICULTIES = [
    "Casual (Level 1)",
    "Fan (Level 2)",
    "Hardcore (Level 3)",
    "Triple Threat (Expert)"
]

VALID_QUESTION_TYPES = {"Standard", "List Question"}

THEMES_ENCYCLOPEDIA = {
    "Tier 1: Core Themes": [
        "Certain Years & Decades",
        "Region-Based (Only In America / U WOT M8? / Nani?)",
        "Known By Another Name",
        "Colours & Music",
        "Double Cross(overs)"
    ],
    "Tier 2: High Potential": [
        "Masked Marvels",
        "Family Business",
        "Royalty & Rulers",
        "Weapons of Choice",
        "Animal Instincts",
        "The Supernatural",
        "Law & Order"
    ],
    "Tier 3: Expert Themes": [
        "Robots & Cyborgs",
        "Elemental Powers",
        "Money Talks",
        "Giants",
        "Time Travel",
        "Tournaments",
        "Seven Deadly Sins"
    ],
    "Sub-Themes": [
        "The Road Trip (Geographic Progression)",
        "The Scientific Method (Periodic Table)",
        "The Taxonomy (Biological Families)",
        "Color Theory (Spectrum)"
    ]
}


# ---------------------------------------------------------------------------
# Individual Safety Checks (Checks 1 to 9)
# ---------------------------------------------------------------------------

def check_1_medium_specification(question: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    CHECK 1: The 'Medium Specification' Rule
    Because franchises overlap, questions must specify which version/medium/platform is asked about.
    """
    q_text = question.get("Question", "")

    # Danger phrases indicating ambiguity
    danger_patterns = [
        (r"\bwhen was it released\b", "Unspecified release region or platform. Specify North America, Japan, console, etc."),
        (r"\bwho voices\b", "Unspecified dub or voice version. Specify 'original English voice' or specific version."),
        (r"\bwhat is the sequel to\b", "Unspecified sequel type. Specify 'direct narrative sequel'."),
        (r"\bwho is the gym leader of\b", "Unspecified version (Video game vs. Anime). Specify game title."),
        (r"\bwhat console was it on\b", "Unspecified console debut vs. port. Specify 'originally debut'."),
        (r"\bis [a-zA-Z0-9_ ]+ in the game\b", "Unspecified DLC/playable status. Specify 'playable character in the base game'."),
    ]

    for pattern, reason in danger_patterns:
        if re.search(pattern, q_text, re.IGNORECASE):
            return False, f"CHECK 1 Failure: Ambiguous phrasing detected ('{pattern}'). {reason}", "Specify the exact medium, game version, or region (e.g. 'In the original video game...', 'original English voice')."

    # Check for general medium specification indicators
    medium_indicators = [
        "game", "anime", "animated", "film", "movie", "comic", "show", "series",
        "manga", "cartoon", "wrestling", "wrestler", "wwe", "wcw", "aew", "njpw",
        "arcade", "console", "nes", "snes", "playstation", "xbox", "nintendo", "sega",
        "theatrical", "book", "adaptation", "version", "english", "japanese", "live-action"
    ]

    has_medium = any(ind in q_text.lower() for ind in medium_indicators)
    if not has_medium and len(q_text.split()) > 4:
        return False, "CHECK 1 Warning: Question may lack explicit medium/version specification.", "Ensure the question specifies whether it refers to the game, show, comic, or specific version."

    return True, None, None


def check_2_primary_source(question: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    CHECK 2: The 'Primary Source' Test
    Answers must be based on what happened On Screen, In Game, or In the Ring.
    """
    q_text = question.get("Question", "") + " " + question.get("Notes / Hidden Chain", "")

    behind_the_scenes_terms = [
        "toy bio", "unreleased beta", "concept art", "cut content from files",
        "developer interview", "behind the scenes rumor", "deleted scene from script"
    ]

    for term in behind_the_scenes_terms:
        if term in q_text.lower():
            return False, f"CHECK 2 Failure: Relies on non-primary screen/game canon ('{term}').", "Restrict question to on-screen, in-game, or in-ring canon."

    return True, None, None


def check_3_crossover_containment(question: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    CHECK 3: Cross-Over Containment
    Classify questions by the media, not just the IP. Category must be valid A3T pillar.
    """
    category = question.get("Category / Domain", "").strip()
    if not category:
        return False, "CHECK 3 Failure: Missing Category / Domain.", "Assign one of the core domains: Animation, Video Games, or Pro Wrestling."

    if category not in VALID_DOMAINS:
        return False, f"CHECK 3 Failure: Invalid domain '{category}'. Non-A3T category (e.g. general live-action TV).", f"Must be one of: {', '.join(sorted(VALID_DOMAINS))}."

    return True, None, None


def check_4_time_lock(question: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    CHECK 4: The 'Time-Lock' Protocol
    Time-sensitive facts (champions, patch mechanics, records) must be anchored with dates or specific events.
    """
    q_text = question.get("Question", "")

    time_sensitive_patterns = [
        r"\bwho is the [a-zA-Z0-9_ ]+ champion\b",
        r"\bwho holds the record\b",
        r"\bwho is current\b",
        r"\bdoes [a-zA-Z0-9_ ]+ stun\b",
        r"\bwhat is [a-zA-Z0-9_ ]+ finisher\b",
        r"\bwho was in the team\b"
    ]

    time_locks = [
        r"\bas of\b", r"\bin \d{4}\b", r"\bat [a-zA-Z0-9_ ]+ \d{4}\b", r"\bat wrestlemania\b",
        r"\blaunch version\b", r"\boriginal \d{4}\b", r"\bduring their \d{4}\b", r"\b1st\b", r"\b2nd\b"
    ]

    is_time_sensitive = any(re.search(p, q_text, re.IGNORECASE) for p in time_sensitive_patterns)
    has_time_lock = any(re.search(tl, q_text, re.IGNORECASE) for tl in time_locks)

    if is_time_sensitive and not has_time_lock:
        return False, "CHECK 4 Failure: Time-sensitive question is not time-locked with a date, year, or event.", "Time-lock the fact (e.g., 'As of January 2024...', 'At WrestleMania 40...', 'In the launch version of...')."

    return True, None, None


def check_5_subjectivity_ban(question: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    CHECK 5: The 'Subjectivity' Ban
    Never ask for opinions ('best', 'coolest', 'most popular') unless tied to an explicit metric.
    """
    q_text = question.get("Question", "")

    subjective_words = ["best", "coolest", "most popular", "worst", "greatest", "hardest", "favorite"]
    objective_metrics = ["metacritic", "sales", "highest grossing", "speedrun", "award", "voted", "chart", "copies"]

    for word in subjective_words:
        if re.search(rf"\b{word}\b", q_text, re.IGNORECASE):
            has_metric = any(re.search(rf"\b{m}\b", q_text, re.IGNORECASE) for m in objective_metrics)
            if not has_metric:
                return False, f"CHECK 5 Failure: Subjective term '{word}' used without objective metric.", f"Tie opinion terms to an objective metric (e.g., 'Which game had the highest Metacritic score...')."

    return True, None, None


def check_6_list_question_protocol(question: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    CHECK 6: The 'List Question' Protocol
    List questions must have 3-5 items, closed loop, and clear all-or-nothing tag.
    """
    q_type = question.get("Question Type", "").strip()
    if q_type.lower() != "list question":
        return True, None, None

    q_text = question.get("Question", "")
    ans_str = question.get("Answer", "")
    parsed_answers = question.get("parsed_answers", parse_list_answer(ans_str))

    # Check count rule (3-5 items)
    if len(parsed_answers) < 3 or len(parsed_answers) > 5:
        return False, f"CHECK 6 Failure: List question answer count ({len(parsed_answers)}) outside the 3-5 Goldilocks range.", "Adjust the list question scope so the correct answer contains 3 to 5 distinct items."

    # Check infinite pool rule
    infinite_indicators = ["name three", "name 3", "name two", "name 2", "name four", "name 4"]
    closed_loop_indicators = ["released on", "members of", "base game", "in the original", "founding members", "all four", "all three", "the four", "the three", "the five", "all five"]

    q_lower = q_text.lower()
    has_infinite = any(ind in q_lower for ind in infinite_indicators)
    has_closed = any(ind in q_lower for ind in closed_loop_indicators)

    if has_infinite and not has_closed:
        return False, "CHECK 6 Failure: Open-ended list question (infinite pool).", "Make the question a closed loop (e.g., 'Name the three games released on Sega Dreamcast' instead of 'Name three games')."

    return True, None, None


def check_7_specifics_trap(question: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    CHECK 7: The 'Specifics' Trap
    Avoid phrasing that implies a single answer when multiple exist (singular vs. plural phrasing).
    """
    q_text = question.get("Question", "")
    parsed_answers = question.get("parsed_answers", [])

    if len(parsed_answers) > 1:
        # If answer is plural/list, question shouldn't ask "Who played...", "Name the...", "What is the..." singular
        singular_traps = [
            (r"\bwho played\b", "Use 'Name the [X] actors who played...'"),
            (r"\bwhat is the\b", "Use 'Name the [X]...'"),
            (r"\bname the [a-zA-Z0-9_ ]+ book\b", "Use 'Name [X] of the books...'")
        ]
        for trap, fix in singular_traps:
            if re.search(trap, q_text, re.IGNORECASE) and not re.search(r"\b(two|three|four|five|both|all|actors|members)\b", q_text, re.IGNORECASE):
                return False, f"CHECK 7 Failure: Singular trap phrasing detected for multiple answers.", f"{fix}"

    return True, None, None


def check_8_bridge_or_bench(link_text: str) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    CHECK 8: The 'Bridge or Bench' Rule
    Checks link integrity between questions in a chain.
    """
    if not link_text or not link_text.strip():
        return False, "CHECK 8 Failure: Missing link explanation between questions.", "Provide a clear, brief explanation ('The Link') connecting the questions."

    if len(link_text.strip()) > 350:
        return False, "CHECK 8 Failure: Link connection explanation is overly convoluted (> 350 chars).", "Bridge or Bench: simplify the connection or replace the question with a cleaner link."

    return True, None, None


def check_9_deck_balance(questions: List[Dict[str, Any]]) -> Tuple[bool, Optional[str], Optional[str]]:
    """
    CHECK 9: The 'Deck Balance' Rule
    33% standard per domain, no single category > 50% in a non-themed deck.
    """
    if not questions:
        return True, None, None

    category_counts = {}
    total = len(questions)

    for q in questions:
        cat = q.get("Category / Domain", "Unknown").strip()
        category_counts[cat] = category_counts.get(cat, 0) + 1

    for cat, count in category_counts.items():
        ratio = count / total
        if ratio > 0.50:
            return False, f"CHECK 9 Failure: Category '{cat}' dominates {ratio*100:.1f}% of the deck (> 50%).", "Rebalance the deck toward ~33% per pillar (Animation, Video Games, Pro Wrestling)."

    return True, None, None


# ---------------------------------------------------------------------------
# High-Level Helper & Analyzer Functions
# ---------------------------------------------------------------------------

def validate_question(question: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validates CSV schema compliance and safety checks for a single question.
    """
    violations = []
    suggestions = []

    # Required field checks
    required_fields = ["Category / Domain", "Difficulty", "Question Type", "Question", "Answer"]
    for field in required_fields:
        if not question.get(field, "").strip():
            violations.append(f"Missing required field: '{field}'")
            suggestions.append(f"Provide a non-empty value for '{field}'.")

    # Domain check
    domain = question.get("Category / Domain", "").strip()
    if domain and domain not in VALID_DOMAINS:
        violations.append(f"Invalid Category / Domain: '{domain}'")
        suggestions.append(f"Must be one of: {', '.join(sorted(VALID_DOMAINS))}")

    # Difficulty check
    diff = question.get("Difficulty", "").strip()
    if diff and diff not in VALID_DIFFICULTIES:
        violations.append(f"Invalid Difficulty: '{diff}'")
        suggestions.append(f"Must be one of: {', '.join(VALID_DIFFICULTIES)}")

    # Question Type check
    qtype = question.get("Question Type", "").strip()
    if qtype and qtype not in VALID_QUESTION_TYPES:
        violations.append(f"Invalid Question Type: '{qtype}'")
        suggestions.append(f"Must be 'Standard' or 'List Question'.")

    # Run Safety Checks 1-7
    safety_checks = [
        check_1_medium_specification,
        check_2_primary_source,
        check_3_crossover_containment,
        check_4_time_lock,
        check_5_subjectivity_ban,
        check_6_list_question_protocol,
        check_7_specifics_trap
    ]

    for check_fn in safety_checks:
        passed, msg, sug = check_fn(question)
        if not passed:
            if msg: violations.append(msg)
            if sug: suggestions.append(sug)

    success = len(violations) == 0
    message = "Question validated successfully." if success else f"Question failed validation with {len(violations)} issue(s)."

    return {
        "success": success,
        "message": message,
        "data": {
            "question": question.get("Question", ""),
            "category": domain,
            "difficulty": diff,
            "valid_schema": success
        },
        "violations": violations,
        "suggestions": list(dict.fromkeys(suggestions))
    }


def check_safety(target: Any) -> Dict[str, Any]:
    """
    Verifies all 9 Safety Checks for a single question or a deck/list of questions.
    """
    violations = []
    suggestions = []

    if isinstance(target, list):
        # Deck level
        for idx, q in enumerate(target, start=1):
            res = validate_question(q)
            if not res["success"]:
                for v in res["violations"]:
                    violations.append(f"Question #{idx}: {v}")
                for s in res["suggestions"]:
                    suggestions.append(s)

        # CHECK 9 Deck balance
        passed_9, msg_9, sug_9 = check_9_deck_balance(target)
        if not passed_9:
            violations.append(msg_9)
            suggestions.append(sug_9)

        success = len(violations) == 0
        return {
            "success": success,
            "message": f"Deck check completed. {len(target)} question(s) evaluated. {len(violations)} violation(s) found.",
            "data": {"total_questions": len(target), "all_passed": success},
            "violations": violations,
            "suggestions": list(dict.fromkeys(suggestions))
        }

    elif isinstance(target, dict):
        res = validate_question(target)
        # Check link if present
        if target.get("The Link"):
            passed_8, msg_8, sug_8 = check_8_bridge_or_bench(target.get("The Link", ""))
            if not passed_8:
                res["violations"].append(msg_8)
                res["suggestions"].append(sug_8)
                res["success"] = False

        return res

    else:
        return {
            "success": False,
            "message": "Invalid target type for check_safety. Must be question dict or list of question dicts.",
            "data": {},
            "violations": ["Invalid input format."],
            "suggestions": ["Provide a question dict or list of question dicts."]
        }


def check_duplicates(question_text: str, questions_db: List[Dict[str, Any]], threshold: int = 80) -> Dict[str, Any]:
    """
    Finds similar questions using fuzzy matching (fuzzywuzzy token_sort_ratio and ratio).
    """
    matches = []

    if not question_text or not question_text.strip():
        return {
            "success": False,
            "message": "No question text provided for duplicate check.",
            "data": {"matches": []},
            "violations": ["Empty question text."],
            "suggestions": ["Provide valid question text to compare."]
        }

    q_text_clean = question_text.strip().lower()

    for item in questions_db:
        db_q_text = item.get("Question", "").strip()
        if not db_q_text:
            continue

        token_score = fuzz.token_sort_ratio(q_text_clean, db_q_text.lower())
        ratio_score = fuzz.ratio(q_text_clean, db_q_text.lower())
        max_score = max(token_score, ratio_score)

        if max_score >= threshold:
            matches.append({
                "question": db_q_text,
                "answer": item.get("Answer", ""),
                "category": item.get("Category / Domain", ""),
                "similarity_score": max_score,
                "row_number": item.get("_row_number")
            })

    matches.sort(key=lambda x: x["similarity_score"], reverse=True)
    has_duplicates = len(matches) > 0

    return {
        "success": True,
        "message": f"Found {len(matches)} similar question(s) with >= {threshold}% similarity." if has_duplicates else "No duplicate questions found.",
        "data": {
            "query_text": question_text,
            "threshold": threshold,
            "duplicate_count": len(matches),
            "matches": matches
        },
        "violations": [f"Potential duplicate found ({m['similarity_score']}% match): '{m['question']}'" for m in matches[:3]],
        "suggestions": ["Rephrase or replace question if it duplicates existing content."] if has_duplicates else []
    }


def analyze_difficulty(questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates difficulty balance across dataset or provided questions (target: 20% Casual, 40% Fan, 30% Hardcore, 10% Expert).
    """
    total = len(questions)
    if total == 0:
        return {
            "success": False,
            "message": "No questions provided for difficulty analysis.",
            "data": {},
            "violations": ["Empty dataset."],
            "suggestions": ["Provide a list of questions."]
        }

    counts = {
        "Casual (Level 1)": 0,
        "Fan (Level 2)": 0,
        "Hardcore (Level 3)": 0,
        "Triple Threat (Expert)": 0,
        "Uncategorized": 0
    }

    for q in questions:
        diff = q.get("Difficulty", "").strip()
        if diff in counts:
            counts[diff] += 1
        else:
            counts["Uncategorized"] += 1

    percentages = {
        "Casual (Level 1)": round((counts["Casual (Level 1)"] / total) * 100, 1),
        "Fan (Level 2)": round((counts["Fan (Level 2)"] / total) * 100, 1),
        "Hardcore (Level 3)": round((counts["Hardcore (Level 3)"] / total) * 100, 1),
        "Triple Threat (Expert)": round((counts["Triple Threat (Expert)"] / total) * 100, 1),
        "Uncategorized": round((counts["Uncategorized"] / total) * 100, 1),
    }

    target = {
        "Casual (Level 1)": 20.0,
        "Fan (Level 2)": 40.0,
        "Hardcore (Level 3)": 30.0,
        "Triple Threat (Expert)": 10.0
    }

    violations = []
    suggestions = []

    # Check deviation from target
    for tier, target_pct in target.items():
        actual_pct = percentages[tier]
        if abs(actual_pct - target_pct) > 15.0:
            violations.append(f"Difficulty imbalance in '{tier}': actual {actual_pct}% vs target {target_pct}%.")
            if actual_pct < target_pct:
                suggestions.append(f"Add more {tier} questions.")
            else:
                suggestions.append(f"Reduce the proportion of {tier} questions.")

    return {
        "success": len(violations) == 0,
        "message": f"Difficulty analysis completed for {total} questions.",
        "data": {
            "total_questions": total,
            "distribution_counts": counts,
            "distribution_percentages": percentages,
            "target_percentages": target
        },
        "violations": violations,
        "suggestions": suggestions
    }


def generate_draft(topic: str, category: str = "Video Games", difficulty: str = "Fan (Level 2)") -> Dict[str, Any]:
    """
    Creates a question scaffold based on topic, category, and difficulty.
    """
    if category not in VALID_DOMAINS:
        category = "Video Games"

    templates = {
        "Pro Wrestling": [
            f"Who did [Wrestler/Character related to {topic}] defeat to win their first Championship?",
            f"In what year did the iconic {topic} match take place at WrestleMania?",
            f"What was the real, legal name of the wrestler known on screen in {topic}?"
        ],
        "Animation": [
            f"In the animated series {topic}, what is the name of the main character's sidekick?",
            f"Who provides the original English voice for the main protagonist in {topic}?",
            f"In the animated film {topic}, what item is central to the plot?"
        ],
        "Video Games": [
            f"In the video game {topic}, on which console did the game originally debut?",
            f"Who is the final boss of the game {topic}?",
            f"In the video game series {topic}, what is the default starting weapon of the main character?"
        ]
    }

    base_cat = "Video Games"
    for k in templates:
        if k in category:
            base_cat = k
            break

    scaffold_question = templates[base_cat][0]

    draft_question = {
        "Deck / Theme": topic,
        "Sequence / Q#": "Q1",
        "Category / Domain": category,
        "Difficulty": difficulty,
        "Question Type": "Standard",
        "Question": scaffold_question,
        "Answer": "[INSERT ANSWER HERE]",
        "The Link": f"Links to subsequent questions in the {topic} deck.",
        "Notes / Hidden Chain": "",
        "Connection Type": "Narrative",
        "Franchise / IP": topic,
        "Status / Playtested": "Draft",
        "Safety Checks Passed": "FALSE",
        "Sub-Theme": ""
    }

    return {
        "success": True,
        "message": f"Generated question scaffold for topic '{topic}'.",
        "data": {
            "draft": draft_question
        },
        "violations": [],
        "suggestions": [
            "Replace placeholders in Question and Answer fields.",
            "Verify that medium/version is time-locked and properly specified."
        ]
    }


def list_themes() -> Dict[str, Any]:
    """
    Shows all available themes from Question-Writer-Guidelines.
    """
    return {
        "success": True,
        "message": "Retrieved available themes and sub-themes.",
        "data": {
            "themes": THEMES_ENCYCLOPEDIA
        },
        "violations": [],
        "suggestions": []
    }


def find_questions_by_domain(domain: str, questions_db: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Filters questions by Animation / Video Games / Pro Wrestling.
    """
    matched = []
    domain_clean = domain.strip().lower()

    for q in questions_db:
        cat = q.get("Category / Domain", "").strip().lower()
        if domain_clean in cat:
            matched.append(q)

    return {
        "success": True,
        "message": f"Found {len(matched)} question(s) matching domain '{domain}'.",
        "data": {
            "domain": domain,
            "count": len(matched),
            "questions": matched
        },
        "violations": [],
        "suggestions": []
    }


def validate_chain(chain_questions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Validates a 3-question linked chain for flow, safety, and sequence.
    """
    violations = []
    suggestions = []

    if len(chain_questions) != 3:
        return {
            "success": False,
            "message": f"Chain must consist of exactly 3 questions (got {len(chain_questions)}).",
            "data": {},
            "violations": ["Chain count is not 3."],
            "suggestions": ["Provide a list of exactly 3 linked question dictionaries."]
        }

    for idx, q in enumerate(chain_questions, start=1):
        # Validate schema & safety checks for each question
        val_res = validate_question(q)
        if not val_res["success"]:
            for v in val_res["violations"]:
                violations.append(f"Question Q{idx}: {v}")
            for s in val_res["suggestions"]:
                suggestions.append(s)

        # Check sequence
        seq = q.get("Sequence / Q#", "").strip()
        expected_seq = f"Q{idx}"
        if seq and seq.upper() != expected_seq:
            violations.append(f"Question Q{idx} has sequence label '{seq}', expected '{expected_seq}'.")
            suggestions.append(f"Set 'Sequence / Q#' to '{expected_seq}'.")

    # Check link integrity (CHECK 8)
    for idx in range(2):
        link_text = chain_questions[idx].get("The Link", "") or chain_questions[idx+1].get("The Link", "")
        passed_8, msg_8, sug_8 = check_8_bridge_or_bench(link_text)
        if not passed_8:
            violations.append(f"Link Q{idx+1}->Q{idx+2}: {msg_8}")
            suggestions.append(sug_8)

    # Check category flow (discourage mono-category Game -> Game -> Game)
    cats = [q.get("Category / Domain", "").strip() for q in chain_questions]
    if len(set(cats)) == 1 and cats[0]:
        violations.append(f"Chain category flow warning: All 3 questions are in '{cats[0]}'. Weave between categories for better engagement.")
        suggestions.append("Vary domains across the 3 questions in the chain.")

    success = len(violations) == 0

    return {
        "success": success,
        "message": "Chain validation passed." if success else f"Chain validation failed with {len(violations)} issue(s).",
        "data": {
            "chain_length": len(chain_questions),
            "categories": cats,
            "valid_chain": success
        },
        "violations": violations,
        "suggestions": list(dict.fromkeys(suggestions))
    }
