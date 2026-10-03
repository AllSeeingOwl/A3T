import pytest
from src.csv_parser import parse_list_answer, format_list_answer, parse_csv_content, export_questions_to_csv
from src.validators import (
    check_1_medium_specification,
    check_2_primary_source,
    check_3_crossover_containment,
    check_4_time_lock,
    check_5_subjectivity_ban,
    check_6_list_question_protocol,
    check_7_specifics_trap,
    check_8_bridge_or_bench,
    check_9_deck_balance,
    validate_question,
    check_duplicates,
    analyze_difficulty,
    check_safety,
    generate_draft,
    list_themes,
    find_questions_by_domain,
    validate_chain
)

# ---------------------------------------------------------------------------
# CSV Parser Tests
# ---------------------------------------------------------------------------

def test_parse_list_answer():
    assert parse_list_answer("Blinky, Pinky, Inky, and Clyde") == ["Blinky", "Pinky", "Inky", "Clyde"]
    assert parse_list_answer("Red, Blue, Green") == ["Red", "Blue", "Green"]
    assert parse_list_answer("Mario and Luigi") == ["Mario", "Luigi"]
    assert parse_list_answer("") == []


def test_format_list_answer():
    assert format_list_answer(["Blinky", "Pinky", "Inky", "Clyde"]) == "Blinky, Pinky, Inky, and Clyde"
    assert format_list_answer(["Mario", "Luigi"]) == "Mario and Luigi"
    assert format_list_answer(["Sonic"]) == "Sonic"


def test_csv_parse_and_export():
    sample_csv = (
        "Deck / Theme,Sequence / Q#,Category / Domain,Difficulty,Question Type,Question,Answer,The Link,Notes / Hidden Chain,Connection Type,Franchise / IP,Status / Playtested,Safety Checks Passed,Sub-Theme\n"
        ",,Video Games,Casual (Level 1),List Question,Name four pacman ghosts.,\"Blinky, Pinky, Inky, and Clyde\",,,,,,FALSE,\n"
    )
    parsed = parse_csv_content(sample_csv)
    assert len(parsed) == 1
    assert parsed[0]["Category / Domain"] == "Video Games"
    assert parsed[0]["parsed_answers"] == ["Blinky", "Pinky", "Inky", "Clyde"]

    exported = export_questions_to_csv(parsed)
    assert "Video Games" in exported
    assert "List Question" in exported


# ---------------------------------------------------------------------------
# Safety Checks 1-9 Unit Tests
# ---------------------------------------------------------------------------

def test_check_1_medium_specification():
    # Ambiguous question (lacks medium/version)
    q_fail = {"Question": "When was it released?"}
    passed, msg, _ = check_1_medium_specification(q_fail)
    assert not passed
    assert "CHECK 1" in msg

    # Properly specified question
    q_pass = {"Question": "In the original video game released in 1985 in North America, on which console did Super Mario Bros. debut?"}
    passed, _, _ = check_1_medium_specification(q_pass)
    assert passed


def test_check_2_primary_source():
    # Toy bio / BTS
    q_fail = {"Question": "According to a toy bio, what was the character's secret weapon?", "Notes / Hidden Chain": ""}
    passed, msg, _ = check_2_primary_source(q_fail)
    assert not passed
    assert "CHECK 2" in msg

    # Primary canon
    q_pass = {"Question": "In the animated show, what color is SpongeBob SquarePants?", "Notes / Hidden Chain": ""}
    passed, _, _ = check_2_primary_source(q_pass)
    assert passed


def test_check_3_crossover_containment():
    # Invalid domain (e.g., Live Action TV / General Knowledge)
    q_fail = {"Category / Domain": "Live Action TV"}
    passed, msg, _ = check_3_crossover_containment(q_fail)
    assert not passed
    assert "CHECK 3" in msg

    # Valid domain
    q_pass = {"Category / Domain": "Animation"}
    passed, _, _ = check_3_crossover_containment(q_pass)
    assert passed


def test_check_4_time_lock():
    # Unlocked time-sensitive question
    q_fail = {"Question": "Who is the WWE Champion?"}
    passed, msg, _ = check_4_time_lock(q_fail)
    assert not passed
    assert "CHECK 4" in msg

    # Time-locked question
    q_pass = {"Question": "Who was the WWE Champion at WrestleMania 40 in 2024?"}
    passed, _, _ = check_4_time_lock(q_pass)
    assert passed


def test_check_5_subjectivity_ban():
    # Opinion without metric
    q_fail = {"Question": "What is the best Zelda video game?"}
    passed, msg, _ = check_5_subjectivity_ban(q_fail)
    assert not passed
    assert "CHECK 5" in msg

    # Tied to metric
    q_pass = {"Question": "Which Zelda video game has the highest Metacritic score?"}
    passed, _, _ = check_5_subjectivity_ban(q_pass)
    assert passed


def test_check_6_list_question_protocol():
    # Infinite pool
    q_fail_infinite = {
        "Question Type": "List Question",
        "Question": "Name three Sonic games.",
        "Answer": "Sonic 1, Sonic 2, Sonic 3",
        "parsed_answers": ["Sonic 1", "Sonic 2", "Sonic 3"]
    }
    passed, msg, _ = check_6_list_question_protocol(q_fail_infinite)
    assert not passed

    # Valid closed loop with 4 items
    q_pass = {
        "Question Type": "List Question",
        "Question": "Name the four ghosts from the original Pac-Man arcade game.",
        "Answer": "Blinky, Pinky, Inky, and Clyde",
        "parsed_answers": ["Blinky", "Pinky", "Inky", "Clyde"]
    }
    passed, _, _ = check_6_list_question_protocol(q_pass)
    assert passed


def test_check_7_specifics_trap():
    # Singular trap for plural answer
    q_fail = {
        "Question": "Who played Mario in the 1993 live-action film?",
        "parsed_answers": ["Bob Hoskins", "John Leguizamo"]
    }
    passed, msg, _ = check_7_specifics_trap(q_fail)
    assert not passed

    # Plural phrasing
    q_pass = {
        "Question": "Name the two actors who played the Mario Bros in the 1993 live-action film.",
        "parsed_answers": ["Bob Hoskins", "John Leguizamo"]
    }
    passed, _, _ = check_7_specifics_trap(q_pass)
    assert passed


def test_check_8_bridge_or_bench():
    # Empty link
    passed, msg, _ = check_8_bridge_or_bench("")
    assert not passed

    # Valid link
    passed, _, _ = check_8_bridge_or_bench("Both characters appeared in the 1998 crossover game.")
    assert passed


def test_check_9_deck_balance():
    # Imbalanced deck (> 50% single category)
    deck_imbalanced = [
        {"Category / Domain": "Video Games"},
        {"Category / Domain": "Video Games"},
        {"Category / Domain": "Video Games"},
        {"Category / Domain": "Animation"}
    ]
    passed, msg, _ = check_9_deck_balance(deck_imbalanced)
    assert not passed

    # Balanced deck
    deck_balanced = [
        {"Category / Domain": "Video Games"},
        {"Category / Domain": "Animation"},
        {"Category / Domain": "Pro Wrestling"}
    ]
    passed, _, _ = check_9_deck_balance(deck_balanced)
    assert passed


# ---------------------------------------------------------------------------
# Core Tool Integration Tests
# ---------------------------------------------------------------------------

def test_validate_question_full():
    valid_q = {
        "Category / Domain": "Video Games",
        "Difficulty": "Fan (Level 2)",
        "Question Type": "Standard",
        "Question": "In the video game Super Mario Bros., on which console did it originally debut in North America in 1985?",
        "Answer": "Nintendo Entertainment System (NES)"
    }
    res = validate_question(valid_q)
    assert res["success"] is True
    assert len(res["violations"]) == 0


def test_check_duplicates_function():
    sample_db = [
        {"Question": "What color are Mario's suspenders?", "Answer": "Blue", "Category / Domain": "Video Games", "_row_number": 1}
    ]
    res = check_duplicates("What color are Mario's suspenders?", sample_db, threshold=80)
    assert res["success"] is True
    assert res["data"]["duplicate_count"] == 1
    assert res["data"]["matches"][0]["similarity_score"] == 100


def test_analyze_difficulty_function():
    sample_questions = [
        {"Difficulty": "Casual (Level 1)"},
        {"Difficulty": "Casual (Level 1)"},
        {"Difficulty": "Fan (Level 2)"},
        {"Difficulty": "Fan (Level 2)"},
        {"Difficulty": "Fan (Level 2)"},
        {"Difficulty": "Hardcore (Level 3)"},
        {"Difficulty": "Hardcore (Level 3)"},
        {"Difficulty": "Hardcore (Level 3)"},
        {"Difficulty": "Triple Threat (Expert)"},
        {"Difficulty": "Fan (Level 2)"}
    ]
    res = analyze_difficulty(sample_questions)
    assert res["data"]["total_questions"] == 10
    assert res["data"]["distribution_counts"]["Casual (Level 1)"] == 2


def test_generate_draft_function():
    res = generate_draft("Pokémon", category="Video Games", difficulty="Casual (Level 1)")
    assert res["success"] is True
    assert "Pokémon" in res["data"]["draft"]["Question"]


def test_list_themes_function():
    res = list_themes()
    assert res["success"] is True
    assert "Tier 1: Core Themes" in res["data"]["themes"]


def test_find_questions_by_domain_function():
    sample_db = [
        {"Category / Domain": "Animation", "Question": "Q1"},
        {"Category / Domain": "Video Games", "Question": "Q2"}
    ]
    res = find_questions_by_domain("Animation", sample_db)
    assert res["success"] is True
    assert res["data"]["count"] == 1


def test_validate_chain_function():
    valid_chain = [
        {
            "Sequence / Q#": "Q1",
            "Category / Domain": "Video Games",
            "Difficulty": "Casual (Level 1)",
            "Question Type": "Standard",
            "Question": "In the video game series Super Mario, what color are Mario's suspenders?",
            "Answer": "Blue",
            "The Link": "Mario debuted in video games before featuring in animated shows."
        },
        {
            "Sequence / Q#": "Q2",
            "Category / Domain": "Animation",
            "Difficulty": "Fan (Level 2)",
            "Question Type": "Standard",
            "Question": "In the animated show The Super Mario Bros. Super Show!, which wrestler played Mario live-action?",
            "Answer": "Captain Lou Albano",
            "The Link": "Lou Albano was a famous pro wrestler in the 1980s."
        },
        {
            "Sequence / Q#": "Q3",
            "Category / Domain": "Pro Wrestling",
            "Difficulty": "Fan (Level 2)",
            "Question Type": "Standard",
            "Question": "Which WWE tag team did Captain Lou Albano manage to the tag team championship in 1984?",
            "Answer": "The U.S. Express",
            "The Link": "Connects back to the 1980s wrestling era."
        }
    ]
    res = validate_chain(valid_chain)
    assert res["success"] is True
    assert len(res["violations"]) == 0
