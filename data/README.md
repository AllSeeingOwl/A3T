# A3T Question Database

The `questions.csv` file contains the master database of trivia questions for **Always A (Trivial) Triple Threat (A3T)**.

## 📝 CSV Schema

The CSV file must adhere to the following schema:

| Column Name | Required | Description |
| :--- | :--- | :--- |
| **Deck / Theme** | Optional | The specific theme or deck the question belongs to (e.g., "Certain Years & Decades"). |
| **Sequence / Q#** | Optional | The order of the question within a specific chain (e.g., "Q1", "Q2"). |
| **Category / Domain** | **Yes** | The core pillar: `Animation`, `Video Games`, `Pro Wrestling`, or combinations (e.g., `Video Games / Animation`). |
| **Difficulty** | **Yes** | The difficulty tier: `Casual (Level 1)`, `Fan (Level 2)`, `Hardcore (Level 3)`, `Triple Threat (Expert)`. |
| **Question Type** | **Yes** | Either `Standard` or `List Question`. |
| **Question** | **Yes** | The trivia question text. |
| **Answer** | **Yes** | The correct answer. For list questions, format as a comma-separated list or natural sentence (e.g., "Blinky, Pinky, Inky, and Clyde"). |
| **The Link** | Optional | The explanation of how this question links to the previous or next one. |
| **Notes / Hidden Chain** | Optional | Additional context, host notes, or the hidden meta-theme connection. |
| **Connection Type** | Optional | The type of link (e.g., "Narrative", "Meta"). |
| **Franchise / IP** | Optional | The specific franchise the question is about (e.g., "Pokémon", "WWE"). |
| **Status / Playtested** | Optional | Development status (e.g., "Draft", `TRUE`, `FALSE`). |
| **Safety Checks Passed** | Optional | Whether the question has passed the 8 Safety Checks (`TRUE` / `FALSE`). |
| **Sub-Theme** | Optional | A more specific categorization within a larger theme. |

## ✍️ Contribution Guidelines

1. **Review the Rules:** Read the [Question Writer Guidelines](../docs/Question-Writer-Guidelines.md) to understand the "Elevator Technique" for difficulty, the 8 Safety Checks, and how to balance chains.
2. **Format:** Use standard CSV formatting. Ensure fields with commas are properly enclosed in double quotes (e.g., `"Blinky, Pinky, Inky, and Clyde"`).
3. **Categories:** Stick strictly to the defined categories (`Animation`, `Video Games`, `Pro Wrestling`, or their combinations).
4. **Validation:** Before submitting a Pull Request, ensure your additions do not break the automated validation checks.
5. **Testing:** If developing locally, you can test your questions by loading the CSV into the game.

## 💻 Using Questions in Development

The game provides a custom hook to interact with the database:

```typescript
import { useQuestionDatabase } from '@/hooks/useQuestionDatabase';

const { loadQuestions, getQuestionsByDifficulty, getQuestionsByDomain, getQuestionsByDeck } = useQuestionDatabase();

// Load the CSV data (e.g., via fetch or import)
loadQuestions(csvString);

// Retrieve questions
const casualAnimationQuestions = getQuestionsByDomain('Animation');
```
