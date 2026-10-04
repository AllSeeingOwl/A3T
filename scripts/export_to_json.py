#!/usr/bin/env python3
import os
import json
import argparse
from datetime import datetime, timezone
import sys

# Add root directory to path to import src modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.csv_parser import load_questions_from_csv


def export_csv_to_json(csv_path: str, output_path: str):
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        sys.exit(1)

    raw_questions = load_questions_from_csv(csv_path)

    formatted_questions = []
    by_difficulty = {
        "Casual (Level 1)": 0,
        "Fan (Level 2)": 0,
        "Hardcore (Level 3)": 0,
        "Triple Threat (Expert)": 0
    }
    by_domain = {
        "Animation": 0,
        "Video Games": 0,
        "Pro Wrestling": 0,
        "Combined": 0
    }

    for q in raw_questions:
        q_item = {
            "deck": q.get("Deck / Theme", "").strip(),
            "sequence": q.get("Sequence / Q#", "").strip(),
            "category": q.get("Category / Domain", "").strip(),
            "difficulty": q.get("Difficulty", "").strip(),
            "type": q.get("Question Type", "").strip(),
            "question": q.get("Question", "").strip(),
            "answer": q.get("Answer", "").strip(),
            "link": q.get("The Link", "").strip(),
            "franchise": q.get("Franchise / IP", "").strip()
        }
        formatted_questions.append(q_item)

        # Count difficulty
        diff = q_item["difficulty"]
        matched_diff = False
        for k in by_difficulty:
            if k in diff or diff.startswith(k.split()[0]):
                by_difficulty[k] += 1
                matched_diff = True
                break
        if not matched_diff and "Casual" in diff:
            by_difficulty["Casual (Level 1)"] += 1

        # Count domain
        cat = q_item["category"]
        if "/" in cat or "Combined" in cat or "All Three" in cat:
            by_domain["Combined"] += 1
        elif "Animation" in cat:
            by_domain["Animation"] += 1
        elif "Video Games" in cat or "Game" in cat:
            by_domain["Video Games"] += 1
        elif "Wrestling" in cat:
            by_domain["Pro Wrestling"] += 1
        else:
            by_domain["Combined"] += 1

    metadata = {
        "total_questions": len(formatted_questions),
        "last_updated": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "by_difficulty": by_difficulty,
        "by_domain": by_domain
    }

    output_data = {
        "questions": formatted_questions,
        "metadata": metadata
    }

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)

    print(f"Successfully exported {len(formatted_questions)} questions from {csv_path} to {output_path}")


def main():
    parser = argparse.ArgumentParser(description="Export questions CSV to JSON format.")
    parser.add_argument("--input", default="data/questions.csv", help="Path to input questions CSV")
    parser.add_argument("--output", default="src/data/questions.json", help="Path to output questions JSON")
    args = parser.parse_args()

    export_csv_to_json(args.input, args.output)


if __name__ == "__main__":
    main()
