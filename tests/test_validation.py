import json
import os
import subprocess
import tempfile
import unittest
from scripts.validate_questions_pr import (
    parse_csv_diff,
    validate_question,
    analyze_difficulty_balance,
    load_config
)
from scripts.generate_pr_comment import generate_markdown
from scripts.export_to_json import export_csv_to_json


class TestValidationPR(unittest.TestCase):

    def setUp(self):
        self.config = load_config("config/validation_rules.yaml")

    def test_parse_csv_diff(self):
        diff_content = """--- a/data/questions.csv
+++ b/data/questions.csv
@@ -1,3 +1,4 @@
Deck / Theme,Sequence / Q#,Category / Domain,Difficulty,Question Type,Question,Answer,The Link,Notes / Hidden Chain,Connection Type,Franchise / IP,Status / Playtested,Safety Checks Passed,Sub-Theme
+Sample Chain,Q1,Animation,Casual (Level 1),Standard,"In Tekken, which character wears a jaguar mask?",King,"Connects to fighting games",,,Tekken,Draft,TRUE,
"""
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".patch") as f:
            f.write(diff_content)
            patch_path = f.name

        try:
            questions = parse_csv_diff(patch_path)
            self.assertEqual(len(questions), 1)
            self.assertEqual(questions[0]["Question"], "In Tekken, which character wears a jaguar mask?")
            self.assertEqual(questions[0]["Answer"], "King")
        finally:
            if os.path.exists(patch_path):
                os.remove(patch_path)

    def test_validate_question(self):
        q_valid = {
            "Deck / Theme": "Sample Chain",
            "Sequence / Q#": "Q1",
            "Category / Domain": "Video Games",
            "Difficulty": "Casual (Level 1)",
            "Question Type": "Standard",
            "Question": "In the video game Tekken, which character wears a jaguar mask?",
            "Answer": "King",
            "The Link": "Connects to fighting game lore",
            "Notes / Hidden Chain": "",
            "Connection Type": "Narrative",
            "Franchise / IP": "Tekken",
            "Status / Playtested": "Draft",
            "Safety Checks Passed": "TRUE",
            "Sub-Theme": ""
        }
        res = validate_question(q_valid, self.config)
        self.assertGreaterEqual(res["passed_checks"], 8)

    def test_analyze_difficulty_balance(self):
        questions = [
            {"Difficulty": "Casual (Level 1)"},
            {"Difficulty": "Fan (Level 2)"},
            {"Difficulty": "Fan (Level 2)"},
            {"Difficulty": "Hardcore (Level 3)"},
            {"Difficulty": "Triple Threat (Expert)"}
        ]
        res = analyze_difficulty_balance(questions)
        self.assertIn("current", res)
        self.assertEqual(res["current"]["Casual (Level 1)"], 0.20)
        self.assertEqual(res["current"]["Fan (Level 2)"], 0.40)

    def test_generate_markdown(self):
        report = {
            "total_questions": 1,
            "passed": 1,
            "failed": 0,
            "critical_failures": 0,
            "warnings": 0,
            "by_question": [
                {
                    "index": 0,
                    "question": "Sample Question",
                    "passed_checks": 9,
                    "failed_checks": [],
                    "safety_score": 1.0,
                    "violations": []
                }
            ],
            "duplicates": [],
            "difficulty_analysis": {
                "target": {"Casual (Level 1)": 0.20},
                "current": {"Casual (Level 1)": 0.20},
                "status": "PASS"
            }
        }
        md = generate_markdown(report)
        self.assertIn("Question Validation Report", md)
        self.assertIn("APPROVED FOR MERGE", md)

    def test_export_csv_to_json(self):
        with tempfile.NamedTemporaryFile("w", delete=False, suffix=".json") as f:
            out_json = f.name

        try:
            export_csv_to_json("data/questions.csv", out_json)
            self.assertTrue(os.path.exists(out_json))
            with open(out_json, "r", encoding="utf-8") as f:
                data = json.load(f)
            self.assertIn("questions", data)
            self.assertIn("metadata", data)
        finally:
            if os.path.exists(out_json):
                os.remove(out_json)


if __name__ == "__main__":
    unittest.main()
