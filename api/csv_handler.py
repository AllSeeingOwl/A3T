import csv
import os
from typing import List, Dict, Any, Optional
from src.csv_parser import EXPECTED_COLUMNS, DEFAULT_CSV_PATH

DEFAULT_GENERATED_CSV_PATH = os.path.join(
    os.path.dirname(__file__), "..", "data", "generated_questions.csv"
)

def save_questions_to_csv(
    questions_list: List[Dict[str, Any]],
    filepath: Optional[str] = None
) -> str:
    """
    Saves a list of question dicts to a CSV file adhering to the 14-column A3T CSV schema.
    If filepath is not provided, defaults to data/generated_questions.csv.
    Appends to file if it already exists with headers, otherwise creates new file.
    Returns the path to the written CSV file.
    """
    target_path = filepath or DEFAULT_GENERATED_CSV_PATH
    os.makedirs(os.path.dirname(os.path.abspath(target_path)), exist_ok=True)

    file_exists = os.path.exists(target_path) and os.path.getsize(target_path) > 0

    mode = "a" if file_exists else "w"
    with open(target_path, mode=mode, encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=EXPECTED_COLUMNS, extrasaction="ignore")
        if not file_exists:
            writer.writeheader()

        for q in questions_list:
            row = {
                "Deck / Theme": q.get("Deck / Theme", q.get("deck", q.get("theme", ""))),
                "Sequence / Q#": q.get("Sequence / Q#", q.get("sequence", "")),
                "Category / Domain": q.get("Category / Domain", q.get("domain", q.get("category", ""))),
                "Difficulty": q.get("Difficulty", q.get("difficulty", "")),
                "Question Type": q.get("Question Type", q.get("question_type", "Standard")),
                "Question": q.get("Question", q.get("question", "")),
                "Answer": q.get("Answer", q.get("answer", "")),
                "The Link": q.get("The Link", q.get("the_link", q.get("link_from_previous", ""))),
                "Notes / Hidden Chain": q.get("Notes / Hidden Chain", q.get("notes", "")),
                "Connection Type": q.get("Connection Type", q.get("connection_type", "")),
                "Franchise / IP": q.get("Franchise / IP", q.get("franchise", "")),
                "Status / Playtested": q.get("Status / Playtested", q.get("status", "Generated")),
                "Safety Checks Passed": q.get("Safety Checks Passed", q.get("safety_checks_passed", "TRUE")),
                "Sub-Theme": q.get("Sub-Theme", q.get("sub_theme", ""))
            }
            writer.writerow(row)

    return target_path
