import csv
import io
import os
from typing import List, Dict, Any, Optional

EXPECTED_COLUMNS = [
    "Deck / Theme",
    "Sequence / Q#",
    "Category / Domain",
    "Difficulty",
    "Question Type",
    "Question",
    "Answer",
    "The Link",
    "Notes / Hidden Chain",
    "Connection Type",
    "Franchise / IP",
    "Status / Playtested",
    "Safety Checks Passed",
    "Sub-Theme"
]

DEFAULT_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "questions.csv")


def parse_list_answer(answer_str: str) -> List[str]:
    """
    Parses a list answer string into discrete items.
    Handles comma-separated values, 'and', and quoted lists.
    Examples:
        'Blinky, Pinky, Inky, and Clyde' -> ['Blinky', 'Pinky', 'Inky', 'Clyde']
        'Red, Blue, Green' -> ['Red', 'Blue', 'Green']
    """
    if not answer_str:
        return []

    # Strip wrapping quotes if any
    clean_str = answer_str.strip().strip('"').strip("'")

    # Split by comma first
    parts = clean_str.split(',')
    items = []
    for p in parts:
        item = p.strip()
        # Handle 'and ' prefix in final item of list
        if item.lower().startswith('and '):
            item = item[4:].strip()
        if item:
            items.append(item)

    # If no commas were present but ' and ' is used
    if len(items) == 1 and ' and ' in items[0]:
        subparts = items[0].split(' and ')
        items = [sp.strip() for sp in subparts if sp.strip()]

    return items


def format_list_answer(items: List[str]) -> str:
    """
    Formats a list of strings into an Oxford comma natural list string for answers.
    Example: ['Blinky', 'Pinky', 'Inky', 'Clyde'] -> 'Blinky, Pinky, Inky, and Clyde'
    """
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def load_questions_from_csv(csv_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Loads questions from a CSV file. If path is omitted, uses data/questions.csv.
    """
    path = csv_path or DEFAULT_CSV_PATH
    if not os.path.exists(path):
        return []

    with open(path, mode="r", encoding="utf-8-sig") as f:
        content = f.read()
    return parse_csv_content(content)


def parse_csv_content(csv_content: str) -> List[Dict[str, Any]]:
    """
    Parses CSV content string into a list of dictionaries adhering to the 14-column schema.
    """
    reader = csv.DictReader(io.StringIO(csv_content))
    questions = []

    for row_idx, row in enumerate(reader, start=1):
        # Normalize dict key names in case of whitespace
        normalized_row = {k.strip(): (v.strip() if v else "") for k, v in row.items() if k}

        # Ensure all expected columns are present in row dict
        full_row = {col: normalized_row.get(col, "") for col in EXPECTED_COLUMNS}
        full_row["_row_number"] = row_idx

        # Check if question type is List Question and add parsed_list_answers
        if full_row["Question Type"].lower() == "list question":
            full_row["parsed_answers"] = parse_list_answer(full_row["Answer"])
        else:
            full_row["parsed_answers"] = [full_row["Answer"]] if full_row["Answer"] else []

        questions.append(full_row)

    return questions


def export_questions_to_csv(questions: List[Dict[str, Any]]) -> str:
    """
    Converts a list of question dictionaries back into standard CSV string format.
    """
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=EXPECTED_COLUMNS, extrasaction="ignore")
    writer.writeheader()

    for q in questions:
        row = {col: q.get(col, "") for col in EXPECTED_COLUMNS}
        writer.writerow(row)

    return output.getvalue()
