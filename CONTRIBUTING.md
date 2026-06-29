# Contributing to A3T

Thank you for your interest in contributing to **Always A (Trivial) Triple Threat (A3T)**!

We welcome contributions to both the codebase and the official question database. This document outlines the process for contributing.

## 🎯 Contributing Questions

The heart of A3T is "The Chain" — the trivia links connecting Animation, Video Games, and Pro Wrestling. We are always looking for new, clever chains to add to the database.

### 1. Review the Guidelines
Before writing questions, you **must** read the [Question Writer Guidelines](./docs/Question-Writer-Guidelines.md). This covers:
- The "Elevator Technique" for balancing difficulty
- The 8 Safety Checks (crucial for preventing disputes)
- The Theme Encyclopedia

### 2. Format Your Submission
Questions are managed via a CSV database located at [`data/questions.csv`](./data/questions.csv).
- Read the [Data README](./data/README.md) for column definitions and requirements.
- Ensure you format list answers correctly (comma-separated or natural language).

### 3. Local Testing (Optional but Recommended)
To test your questions in the actual game UI:
1. Clone the repository
2. Run `npm install`
3. Add your questions to `data/questions.csv`
4. Run `npm run dev` to launch the local server

### 4. Submit a Pull Request
- Create a new branch for your questions (e.g., `feature/new-anime-deck`).
- Submit a PR against the `main` branch.
- **Automated Validation:** GitHub Actions will automatically validate your CSV formatting. If the checks fail, the bot will leave a comment explaining which rows contain errors. Fix the errors and push again.
- **Code Review:** The maintainers will review your submission for adherence to the 8 Safety Checks and overall factual accuracy.

---

## 💻 Contributing Code

If you want to contribute to the digital game board application (React/TypeScript):

### Local Environment Setup
1. Ensure Node.js is installed.
2. Clone the repo: `git clone <repository-url>`
3. Install dependencies: `npm ci`
4. Start the dev server: `npm run dev`

### Development Guidelines
- **TypeScript:** This project uses strict TypeScript configurations. Ensure all new code is properly typed. Run `npm run typecheck` before submitting.
- **Linting:** Ensure your code passes standard linting with `npm run lint`.
- **State Management:** We use Zustand. Avoid prop-drilling; connect components directly to the store where appropriate using selectors.
- **Styling:** We use Tailwind CSS. Stick to the existing dark-synthwave color palette (`slate`, `pink`, `cyan`) defined in `tailwind.config.js`.

### Pull Request Process
1. Create a descriptive branch name (`fix/timer-bug` or `feature/sound-effects`).
2. Keep your PR scope focused on a single issue or feature.
3. Include a description of what changed and why.
4. Ensure all CI checks (Lint, Typecheck, Test) pass.

We look forward to your contributions!
