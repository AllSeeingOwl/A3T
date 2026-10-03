# Always A (Trivial) Triple Threat (A3T)

Welcome to the Digital Proof of Concept (PoC) repository for **Always A (Trivial) Triple Threat (A3T)**!

A3T is an interactive tabletop-companion quiz application built to serve as a digital game board and host controller. It features a dark-synthwave aesthetic with a custom color palette, dynamic link pipelines, and integrated mechanics for hosting team-based trivia matches.

## 📚 Documentation & Game Rules

- **[Game Design Document](./docs/Game-Design-Document.md)** — Complete ruleset, difficulty tiers, and host guidelines
- **[Rules Reference](./docs/Rules-Reference.md)** — Quick lookup for gameplay rules and Red Card system
- **[Question Writer Guidelines](./docs/Question-Writer-Guidelines.md)** — Guide for creating and validating questions
- **[Technical Specification](./Digital%20PoC%20Technical%20Specification.md)** — Architecture and implementation details
- **[Render Deployment Guide](./docs/RENDER_DEPLOYMENT.md)** — Step-by-step setup guide and Render Blueprint details for hosting A3T on Render
- **[Contributing](./CONTRIBUTING.md)** — Guidelines for contributing code and questions

---

## 🤖 A3T Question-Validator MCP Server

The project includes a production-ready **Model Context Protocol (MCP)** server for validating, analyzing, and managing trivia questions in the A3T repository.

### 🛠️ Features & Available MCP Tools

The server exposes 8 primary MCP tools:

1. **`validate_question`**: Check CSV schema compliance and safety rules for a single question.
2. **`check_duplicates`**: Search for similar questions in `data/questions.csv` using fuzzy string matching (`fuzzywuzzy`).
3. **`analyze_difficulty`**: Analyze difficulty tier balance across the dataset against the target split (20% Casual / 40% Fan / 30% Hardcore / 10% Expert).
4. **`check_safety`**: Verify all 9 Safety Checks from `docs/Question-Writer-Guidelines.md` for a single question or an entire deck.
5. **`generate_draft`**: Scaffold a new question template given a topic/theme, category, and difficulty tier.
6. **`list_themes`**: Retrieve all available themes and sub-themes from the Theme Encyclopedia.
7. **`find_questions_by_domain`**: Filter questions by core domain (`Animation`, `Video Games`, `Pro Wrestling`).
8. **`validate_chain`**: Validate a 3-question sequence for link integrity, category flow, and safety compliance.

---

### 🛡️ The 9 Safety Checks

Every question and chain is validated against the 9 Safety Rules:

- **CHECK 1 (Medium Specification):** Verifies explicit medium/version/platform (e.g. video game vs. anime).
- **CHECK 2 (Primary Source Test):** Ensures canon is restricted to on-screen, in-game, or in-ring events.
- **CHECK 3 (Cross-Over Containment):** Validates classification under valid A3T domains (`Animation`, `Video Games`, `Pro Wrestling`).
- **CHECK 4 (Time-Lock Protocol):** Ensures time-sensitive facts (champions, records, patches) are anchored with dates or events.
- **CHECK 5 (Subjectivity Ban):** Disallows opinion words unless tied to objective metrics (e.g., Metacritic score).
- **CHECK 6 (List Question Protocol):** Enforces 3-5 items ("Goldilocks range"), closed loop pools, and explicit quantity tags.
- **CHECK 7 (Specifics Trap):** Prevents singular trap phrasing when multiple answers exist.
- **CHECK 8 (Bridge or Bench Rule):** Validates link connection integrity between adjacent questions in a chain.
- **CHECK 9 (Deck Balance Rule):** Ensures standard decks maintain category balance (~33% per pillar, no single pillar > 50%).

---

### 📦 Standard Response Format

All MCP tool calls return JSON adhering to the unified schema:

```json
{
  "success": true,
  "message": "Human-readable summary of the tool execution.",
  "data": {},
  "violations": [],
  "suggestions": []
}
```

---

### 🚀 Setup & Running the MCP Server

#### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### 2. Start the MCP Server (STDIO Mode)

```bash
./scripts/start_mcp.sh
# or
python3 -m src.mcp_server
```

#### 3. Start the MCP Server (HTTP / FastAPI Mode)

```bash
./scripts/start_mcp.sh http
# or
python3 -m src.mcp_server --http
```
When running in HTTP mode, endpoints are accessible at `http://localhost:8000/api/...` with automatic interactive docs at `http://localhost:8000/docs`.

#### 4. Run Unit Tests

```bash
pytest
```

---

### 💡 Example API Calls

#### Validating a Question (`validate_question`)

```json
{
  "Category / Domain": "Video Games",
  "Difficulty": "Fan (Level 2)",
  "Question Type": "Standard",
  "Question": "In the video game Super Mario Bros., on which console did it originally debut in North America in 1985?",
  "Answer": "Nintendo Entertainment System (NES)"
}
```

#### Checking Safety (`check_safety`)

```json
{
  "Category / Domain": "Pro Wrestling",
  "Difficulty": "Casual (Level 1)",
  "Question Type": "Standard",
  "Question": "Who was the WWE Champion at WrestleMania 40 in 2024?",
  "Answer": "Cody Rhodes"
}
```

---

## 🎯 Question Database

Questions are stored in [`data/questions.csv`](./data/questions.csv).

### Adding Questions

1. Review the [Question Writer Guidelines](./docs/Question-Writer-Guidelines.md)
2. Follow the CSV schema in [`data/README.md`](./data/README.md)
3. Ensure all Safety Checks pass
4. Submit a pull request with your new questions

---

## 🛠️ Local Development (Frontend)

To run the Web UI locally:

1. **Install Node.js dependencies:**
   ```bash
   pnpm install
   ```

2. **Start the Vite dev server:**
   ```bash
   pnpm dev
   ```

3. **Run tests & typechecks:**
   ```bash
   pnpm test
   pnpm typecheck
   pnpm lint
   ```

---

## 🌐 Deployment

- **Render Blueprint Deployment:** See the **[Render Deployment Guide](./docs/RENDER_DEPLOYMENT.md)** for deploying the full app (Frontend & Python API) to Render via `render.yaml`.
- **GitHub Pages:** [https://allseeingowl.github.io/A3T/](https://allseeingowl.github.io/A3T/)
