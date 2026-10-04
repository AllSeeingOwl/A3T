#!/usr/bin/env python3
import os
import sys
import json
import csv
import io
import argparse
from typing import List, Dict, Any, Tuple
import yaml

# Add root directory to path to import src modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

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
    check_duplicates
)
from src.csv_parser import load_questions_from_csv


def load_config(config_path: str = "config/validation_rules.yaml") -> Dict[str, Any]:
    if os.path.exists(config_path):
        with open(config_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return {
        "safety_checks": {
            "check_1_medium_specification": {"severity": "critical"},
            "check_2_primary_source": {"severity": "critical"},
            "check_3_cross_over_containment": {"severity": "high"},
            "check_4_time_lock": {"severity": "high"},
            "check_5_subjectivity": {"severity": "medium"},
            "check_6_list_questions": {"severity": "high"},
            "check_7_specifics": {"severity": "medium"},
            "check_8_link_integrity": {"severity": "high"},
            "check_9_deck_balance": {"severity": "low"}
        },
        "duplicate_detection": {"fuzzy_match_threshold": 0.85, "warn_at": 0.80, "block_at": 0.95},
        "difficulty_target": {
            "Casual (Level 1)": 0.20,
            "Fan (Level 2)": 0.40,
            "Hardcore (Level 3)": 0.30,
            "Triple Threat (Expert)": 0.10
        }
    }


def parse_csv_diff(patch_file: str) -> List[Dict[str, Any]]:
    """
    Parses a unified diff patch file for data/questions.csv and extracts added/modified CSV rows.
    """
    if not os.path.exists(patch_file):
        return []

    with open(patch_file, "r", encoding="utf-8", errors="replace") as f:
        patch_lines = f.readlines()

    added_csv_lines = []
    header_line = None

    # Try loading header line from existing questions.csv if available
    if os.path.exists("data/questions.csv"):
        with open("data/questions.csv", "r", encoding="utf-8") as f:
            header_line = f.readline().strip()

    for line in patch_lines:
        if line.startswith("+++") or line.startswith("---"):
            continue
        if line.startswith("+"):
            content = line[1:].strip()
            if not content:
                continue
            if content.startswith("Deck / Theme") or content.startswith('"Deck / Theme"'):
                header_line = content
            else:
                added_csv_lines.append(content)

    if not added_csv_lines:
        return []

    if not header_line:
        header_line = "Deck / Theme,Sequence / Q#,Category / Domain,Difficulty,Question Type,Question,Answer,The Link,Notes / Hidden Chain,Connection Type,Franchise / IP,Status / Playtested,Safety Checks Passed,Sub-Theme"

    full_csv = header_line + "\n" + "\n".join(added_csv_lines)
    reader = csv.DictReader(io.StringIO(full_csv))
    questions = []
    for row in reader:
        # Clean keys and values
        clean_row = { (k.strip() if k else ""): (v.strip() if v else "") for k, v in row.items() if k }
        if clean_row.get("Question") or clean_row.get("Answer"):
            questions.append(clean_row)

    return questions


def detect_medium_specification(question: Dict[str, Any]) -> bool:
    passed, _, _ = check_1_medium_specification(question)
    return passed


def check_primary_source(question: Dict[str, Any]) -> bool:
    passed, _, _ = check_2_primary_source(question)
    return passed


def validate_cross_over(question: Dict[str, Any]) -> bool:
    passed, _, _ = check_3_crossover_containment(question)
    return passed


def validate_time_lock(question: Dict[str, Any]) -> bool:
    passed, _, _ = check_4_time_lock(question)
    return passed


def check_subjectivity(question: Dict[str, Any]) -> bool:
    passed, _, _ = check_5_subjectivity_ban(question)
    return passed


def validate_list_format(question: Dict[str, Any]) -> bool:
    passed, _, _ = check_6_list_question_protocol(question)
    return passed


def check_singular_plural(question: Dict[str, Any]) -> bool:
    passed, _, _ = check_7_specifics_trap(question)
    return passed


def validate_link_integrity(question: Dict[str, Any]) -> bool:
    link = question.get("The Link", "")
    passed, _, _ = check_8_bridge_or_bench(link)
    return passed


def check_deck_balance(all_questions: List[Dict[str, Any]]) -> bool:
    passed, _, _ = check_9_deck_balance(all_questions)
    return passed


def analyze_difficulty_balance(all_questions: List[Dict[str, Any]], targets: Dict[str, float] = None) -> Dict[str, Any]:
    if targets is None:
        targets = {
            "Casual (Level 1)": 0.20,
            "Fan (Level 2)": 0.40,
            "Hardcore (Level 3)": 0.30,
            "Triple Threat (Expert)": 0.10
        }

    total = len(all_questions)
    if total == 0:
        return {"target": targets, "current": {k: 0.0 for k in targets}, "status": "PASS - No questions to analyze"}

    counts = {k: 0 for k in targets}
    for q in all_questions:
        diff = q.get("Difficulty", "").strip()
        matched = False
        for k in targets:
            if k in diff or diff.startswith(k.split()[0]):
                counts[k] += 1
                matched = True
                break
        if not matched and "Casual" in diff:
            counts["Casual (Level 1)"] += 1

    current = {k: round(counts[k] / total, 2) for k in targets}
    warnings = []
    for k, target in targets.items():
        diff_pct = current[k] - target
        if diff_pct > 0.05:
            warnings.append(f"{k.split()[0]} tier {int(abs(diff_pct)*100)}% over target")
        elif diff_pct < -0.05:
            warnings.append(f"{k.split()[0]} tier {int(abs(diff_pct)*100)}% under target")

    if warnings:
        status = f"WARNING - {', '.join(warnings)}"
    else:
        status = "PASS - Balanced distribution"

    return {"target": targets, "current": current, "status": status}


def validate_question(q: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
    check_map = [
        (1, "CHECK 1: Medium Specification", check_1_medium_specification, "check_1_medium_specification"),
        (2, "CHECK 2: Primary Source Test", check_2_primary_source, "check_2_primary_source"),
        (3, "CHECK 3: Cross-Over Containment", check_3_crossover_containment, "check_3_cross_over_containment"),
        (4, "CHECK 4: Time-Lock Protocol", check_4_time_lock, "check_4_time_lock"),
        (5, "CHECK 5: Subjectivity Ban", check_5_subjectivity_ban, "check_5_subjectivity"),
        (6, "CHECK 6: List Question Protocol", check_6_list_question_protocol, "check_6_list_questions"),
        (7, "CHECK 7: Specifics Trap", check_7_specifics_trap, "check_7_specifics"),
        (8, "CHECK 8: Bridge or Bench Rule", lambda quest: check_8_bridge_or_bench(quest.get("The Link", "")), "check_8_link_integrity"),
    ]

    passed_checks = []
    failed_checks = []
    violations = []
    suggestions = []

    safety_cfgs = config.get("safety_checks", {})

    for check_num, check_name, check_fn, cfg_key in check_map:
        check_cfg = safety_cfgs.get(cfg_key, {})
        if check_cfg.get("enabled", True) is False:
            passed_checks.append(check_num)
            continue

        passed, msg, sug = check_fn(q)
        if passed:
            passed_checks.append(check_num)
        else:
            failed_checks.append(check_num)
            severity = check_cfg.get("severity", "medium").upper()
            violations.append(f"{check_name} ({severity}) - {msg or 'Validation failed'}")
            if sug:
                suggestions.append(sug)

    passed_9, msg_9, sug_9 = check_9_deck_balance([q])
    if passed_9:
        passed_checks.append(9)
    else:
        failed_checks.append(9)
        violations.append(f"CHECK 9: Deck Balance Rule - {msg_9}")
        if sug_9:
            suggestions.append(sug_9)

    total_checks = 9
    safety_score = round(len(passed_checks) / total_checks, 2)

    return {
        "passed_checks": len(passed_checks),
        "failed_checks": failed_checks,
        "safety_score": safety_score,
        "violations": violations,
        "suggestions": suggestions
    }


def main():
    parser = argparse.ArgumentParser(description="Validate questions in a PR diff against safety checks.")
    parser.add_argument("--diff", required=True, help="Path to git diff patch file")
    parser.add_argument("--config", default="config/validation_rules.yaml", help="Path to config file")
    parser.add_argument("--output", default="/tmp/validation_report.json", help="Path to output validation report JSON")
    args = parser.parse_args()

    config = load_config(args.config)
    changed_questions = parse_csv_diff(args.diff)

    existing_questions = []
    if os.path.exists("data/questions.csv"):
        try:
            existing_questions = load_questions_from_csv("data/questions.csv")
        except Exception as e:
            print(f"Warning: could not load existing questions.csv: {e}")

    total_questions = len(changed_questions)
    passed_count = 0
    failed_count = 0
    critical_failures = 0
    warnings_count = 0

    by_question_report = []
    duplicates_report = []

    fuzzy_threshold = config.get("duplicate_detection", {}).get("fuzzy_match_threshold", 0.85) * 100

    for idx, q in enumerate(changed_questions):
        val_res = validate_question(q, config)
        q_text = q.get("Question", "")

        is_passed = len(val_res["failed_checks"]) == 0
        if is_passed:
            passed_count += 1
        else:
            failed_count += 1

        is_critical = any("CRITICAL" in v for v in val_res["violations"])
        if is_critical:
            critical_failures += 1

        is_warning = any("HIGH" in v or "MEDIUM" in v for v in val_res["violations"])
        if is_warning:
            warnings_count += 1

        by_question_report.append({
            "index": idx,
            "question": q_text,
            "passed_checks": val_res["passed_checks"],
            "failed_checks": val_res["failed_checks"],
            "safety_score": val_res["safety_score"],
            "violations": val_res["violations"],
            "suggestions": val_res["suggestions"]
        })

        if existing_questions and q_text:
            dup_res = check_duplicates(q_text, existing_questions, threshold=fuzzy_threshold)
            if dup_res["success"] and dup_res["data"]["duplicate_count"] > 0:
                warnings_count += 1
                for match in dup_res["data"]["matches"]:
                    duplicates_report.append({
                        "new_question": q_text,
                        "existing_match": match["question"],
                        "similarity": round(match["similarity_score"] / 100.0, 2),
                        "action": "WARN - Consider if both questions are needed"
                    })

    # Difficulty analysis across changed questions or full set
    all_q_for_difficulty = existing_questions + changed_questions if existing_questions else changed_questions
    difficulty_analysis = analyze_difficulty_balance(
        all_q_for_difficulty,
        targets=config.get("difficulty_target")
    )

    report = {
        "total_questions": total_questions,
        "passed": passed_count,
        "failed": failed_count,
        "critical_failures": critical_failures,
        "warnings": warnings_count,
        "by_question": by_question_report,
        "duplicates": duplicates_report,
        "difficulty_analysis": difficulty_analysis
    }

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print(f"Validation complete: {total_questions} analyzed, {passed_count} passed, {failed_count} failed, {critical_failures} critical.")


if __name__ == "__main__":
    main()
