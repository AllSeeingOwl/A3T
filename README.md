# Always A (Trivial) Triple Threat (A3T)

Welcome to the Digital Proof of Concept (PoC) repository for **Always A (Trivial) Triple Threat (A3T)**!

A3T is an interactive tabletop-companion quiz application built to serve as a digital game board and host controller. It features a dark-synthwave aesthetic with a custom color palette, dynamic link pipelines, and integrated mechanics for hosting team-based trivia matches.

## 📚 Documentation & Game Rules

- **[Game Design Document](./docs/Game-Design-Document.md)** — Complete ruleset, difficulty tiers, and host guidelines
- **[Rules Reference](./docs/Rules-Reference.md)** — Quick lookup for gameplay rules and Red Card system
- **[Question Writer Guidelines](./docs/Question-Writer-Guidelines.md)** — Guide for creating and validating questions
- **[Technical Specification](./Digital%20PoC%20Technical%20Specification.md)** — Architecture and implementation details
- **[Contributing](./CONTRIBUTING.md)** — Guidelines for contributing code and questions

## 🎯 Question Database

Questions are stored in [`data/questions.csv`](./data/questions.csv).

### Adding Questions

1. Review the [Question Writer Guidelines](./docs/Question-Writer-Guidelines.md)
2. Follow the CSV schema in [`data/README.md`](./data/README.md)
3. Ensure all Safety Checks pass
4. Submit a pull request with your new questions

### Using Questions in Development

```typescript
import { useQuestionDatabase } from '@/hooks/useQuestionDatabase';

const { loadQuestions, getQuestionsByDifficulty } = useQuestionDatabase();
```

## 🚀 Tech Stack

This project is built using a modern frontend stack:
- **React**
- **TypeScript** (with strict configurations)
- **Vite** (for fast development and building)
- **Tailwind CSS** (for styling with a custom dark-synthwave theme)
- **Zustand** (for global game state management)

## 📂 Project Structure

The project follows a modular structure:

- **`src/components/`**: Modular, UI presentation components.
  - `LobbyHub.tsx`: Team setup and deck selection screen.
  - `ArenaBoard.tsx`: Active gameplay interface.
  - `RedCardModal.tsx`: Whistle-blowing referee layout.
  - `SummaryPodium.tsx`: Final scores and winner's podium.
- **`src/data/`**: Contains `defaultDecks.json`, which holds seed data with default thematic chains (including a custom UK-themed pack).
- **`src/hooks/`**: Contains `useGameStore.ts` for central game state management using Zustand.
- **`src/types/`**: Contains `game.ts` with strict TypeScript interfaces and game configurations.

For a deeper dive into the architecture, refer to the [`Digital PoC Technical Specification.md`](./Digital%20PoC%20Technical%20Specification.md) included in this repository.

## 🛠️ Local Development

To run this project locally, ensure you have Node.js installed.

1. **Clone the repository:**
   \`\`\`bash
   git clone <repository-url>
   cd always-a-trivial-triple-threat
   \`\`\`

2. **Install dependencies:**
   For reliable dependency installation, use:
   \`\`\`bash
   npm ci
   \`\`\`

3. **Start the development server:**
   \`\`\`bash
   npm run dev &
   \`\`\`
   This will start the local development server, typically available at `http://localhost:5173`.

4. **Build for production:**
   \`\`\`bash
   npm run build
   \`\`\`
   This will compile TypeScript and build the Vite production application.

## 🌐 Deployment

The application is configured to be deployed to **GitHub Pages** using official GitHub Actions (`actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`).

- **Live Application:** [https://allseeingowl.github.io/A3T/](https://allseeingowl.github.io/A3T/)
- **Configuration Note:** The repository's Pages setting must be manually configured to use 'GitHub Actions' as the source. The Vite base path is configured to `/A3T/`.
