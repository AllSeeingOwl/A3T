# GitHub Integration & Automated PR Workflow

This document explains the automated GitHub Actions workflow setup for validating questions, auto-merging approved pull requests, and deploying updated questions to the live game.

---

## 🚀 Overview

Whenever a contributor updates `data/questions.csv` in a Pull Request, an automated pipeline:
1. **Parses the PR diff** to isolate added or modified questions.
2. **Runs all 9 Safety Checks** (e.g., Medium Specification, Primary Source, Time-Lock, Deck Balance).
3. **Detects duplicate questions** against existing database content using fuzzy matching algorithms.
4. **Analyzes difficulty distribution** against the target ratios (20% Casual / 40% Fan / 30% Hardcore / 10% Expert).
5. **Posts a detailed validation report** as a markdown comment on the PR.
6. **Blocks merging** if critical safety check violations exist.
7. **Auto-merges** approved PRs when all checks pass.
8. **Exports CSV to JSON** and commits `src/data/questions.json` post-merge for live game consumption.

---

## 🛠 Workflows Breakdown

### 1. `Validate Questions` (`.github/workflows/validate-questions.yml`)
- **Trigger:** Pull requests modifying `data/questions.csv`.
- **Script:** `scripts/validate_questions_pr.py` & `scripts/generate_pr_comment.py`
- **Output:** Posts validation comment on PR and sets job pass/fail status based on critical failures.

### 2. `Auto-Merge Approved PRs` (`.github/workflows/auto-merge.yml`)
- **Trigger:** Submitted PR reviews (`github.event.review.state == 'APPROVED'`).
- **Action:** Checks status check results and squash-merges PRs when approved by a code owner.

### 3. `Deploy Questions to Live Game` (`.github/workflows/deploy.yml`)
- **Trigger:** Pushes to `main` branch touching `data/questions.csv`.
- **Script:** `scripts/export_to_json.py`
- **Action:** Converts CSV to `src/data/questions.json` and commits to main to trigger frontend updates.

---

## 🔒 Code Ownership & Protection

Configured in `.github/CODEOWNERS`:
- `data/questions.csv @AllSeeingOwl`
- `.github/workflows/ @AllSeeingOwl`

### Required Repository Settings
- **Require status check:** `Validate Questions` must pass before merging.
- **Require code owner review:** Require at least 1 approval from designated code owners.
