# **Always A (Trivial) Triple Threat (A3T)**

## **Digital Proof of Concept (PoC) Specification & GitHub Backbone**

This document serves as the master architectural specification and file backbone for the **Always A (Trivial) Triple Threat (A3T)** digital proof of concept. It is designed to be committed directly to a GitHub repository, enabling Google’s **Jules AI agent** (or Project IDX workspaces) to parse, generate, and maintain the codebase step-by-step.

### **1\. Repository & File Directory Tree**

To ensure Jules structures your React \+ TypeScript project modularly, instruct it to build the project using this file tree:

always-a-trivial-triple-threat/  
├── .github/  
│   └── workflows/  
│       └── deploy.yml              \# GitHub Pages deployment workflow  
├── public/  
│   └── favicon.ico                 \# Game arena icon  
├── src/  
│   ├── assets/                     \# Custom SVGs / Sound FX  
│   ├── components/                 \# Modular, UI presentation components  
│   │   ├── ArenaBoard.tsx          \# Active gameplay interface  
│   │   ├── LobbyHub.tsx            \# Team setup and deck selection screen  
│   │   ├── RedCardModal.tsx        \# Whistle-blowing referee layout  
│   │   └── SummaryPodium.tsx       \# Final scores and winner's podium  
│   ├── data/  
│   │   └── defaultDecks.json       \# Seed data with default thematic chains  
│   ├── hooks/  
│   │   └── useGameStore.ts         \# Central game state manager  
│   ├── types/  
│   │   └── game.ts                 \# TypeScript interfaces and game configurations  
│   ├── App.tsx                     \# Entry router and global layout  
│   ├── index.css                   \# Global styles & Tailwind config directives  
│   └── main.tsx                    \# React Virtual DOM bootstrap  
├── .gitignore                      \# Git configuration overrides  
├── package.json                    \# Project dependencies & UK-specific scripts  
├── postcss.config.js               \# CSS processing engine config  
├── tailwind.config.js              \# Dark-synthwave color palettes  
├── tsconfig.json                   \# Strict TypeScript compiler options  
└── README.md                       \# This backbone specification file

### **2\. Development Environments & System Configuration**

Below are the base configuration files Jules requires to bootstrap the project with Vite, Tailwind CSS, and strict typing.

#### **2.1 package.json**

{  
  "name": "always-a-trivial-triple-threat",  
  "private": true,  
  "version": "0.1.0",  
  "type": "module",  
  "scripts": {  
    "dev": "vite",  
    "build": "tsc && vite build",  
    "preview": "vite preview"  
  },  
  "dependencies": {  
    "clsx": "^2.1.1",  
    "lucide-react": "^0.450.0",  
    "react": "^19.0.0",  
    "react-dom": "^19.0.0",  
    "tailwind-merge": "^2.5.0"  
  },  
  "devDependencies": {  
    "@types/react": "^19.0.0",  
    "@types/react-dom": "^19.0.0",  
    "@vitejs/plugin-react": "^4.3.0",  
    "autoprefixer": "^10.4.19",  
    "postcss": "^8.4.38",  
    "tailwindcss": "^3.4.4",  
    "typescript": "^5.2.2",  
    "vite": "^5.3.1"  
  }  
}

#### **2.2 tailwind.config.js**

/\*\* @type {import('tailwindcss').Config} \*/  
export default {  
  content: \[  
    "./index.html",  
    "./src/\*\*/\*.{js,ts,jsx,tsx}",  
  \],  
  theme: {  
    extend: {  
      colors: {  
        arena: {  
          slate: '\#0F172A',      // Primary Deep Background  
          navy: '\#1E293B',       // Panel/Card Dark Blue  
          magenta: '\#EC4899',    // Team A / Accent Pink  
          cobalt: '\#3B82F6',     // Team B / Accent Blue  
          crimson: '\#EF4444',    // Red Card Red  
          amber: '\#F59E0B',      // Time-warning Amber  
          gold: '\#FBBF24',       // Championship Yellow  
        }  
      },  
      fontFamily: {  
        display: \['Impact', 'Trebuchet MS', 'sans-serif'\],  
        sans: \['Inter', 'system-ui', 'sans-serif'\],  
      },  
    },  
  },  
  plugins: \[\],  
}

### **3\. TypeScript Definitions (src/types/game.ts)**

Defining types explicitly prevents Jules from hallucinating runtime shapes or generating broken data pipelines.

export type Category \= 'Animation' | 'Video Games' | 'Pro Wrestling';  
export type ScreenState \= 'LOBBY' | 'ARENA' | 'SUMMARY';  
export type QuestionStep \= 0 | 1 | 2; // 0 \= Quest 1, 1 \= Quest 2, 2 \= Quest 3

export interface Question {  
  step: QuestionStep;  
  category: Category;  
  questionText: string;  
  answer: string;  
  acceptedVariants: string\[\];  
  points: number;  
}

export interface ListQuestion {  
  enabled: boolean;  
  listCategory: Category;  
  promptText: string;  
  correctItems: string\[\];  
  requiredToPass: number;  
  points: number;  
}

export interface ChainCard {  
  cardId: string;  
  parentTheme: string;  
  bridgeLinkExplanation: string;  
  questions: \[Question, Question, Question\];  
  listQuestion: ListQuestion;  
}

export interface Deck {  
  deckId: string;  
  deckName: string;  
  deckDescription: string;  
  cards: ChainCard\[\];  
}

export interface Team {  
  name: string;  
  score: number;  
}

export interface GameState {  
  currentScreen: ScreenState;  
  teams: {  
    teamA: Team;  
    teamB: Team;  
  };  
  activeTeam: 'teamA' | 'teamB';  
  selectedDeck: Deck | null;  
  currentCardIndex: number;  
  currentStepIndex: QuestionStep;  
  questionStage: 'HIDDEN' | 'REVEALED\_QUESTION' | 'REVEALED\_ANSWER' | 'STEAL\_WINDOW' | 'LIST\_ACTIVE' | 'LIST\_REVEALED';  
  timerSeconds: number;  
  timerActive: boolean;  
  activeRedCard: 'KAYFABE' | 'VFX' | 'MUPPET' | 'SEMANTICS' | null;  
}

### **4\. Local Database Seed (src/data/defaultDecks.json)**

This pre-seeded file gives the application a highly engaging, fully structured set of test chains, including a custom UK-themed pack to anchor the domestic game testing.

\[  
  {  
    "deckId": "uk-invasion-01",  
    "deckName": "The UK Crossover Special",  
    "deckDescription": "Classic British animations, legendary UK-developed gaming hits, and World of Sport wrestling heroes.",  
    "cards": \[  
      {  
        "cardId": "uk-chain-001",  
        "parentTheme": "Baker Street and Beyond",  
        "bridgeLinkExplanation": "Links a 1980s cartoon hamster living in Baker Street to the voice work of Sir David Jason, bridging to Scotland's DMA Design and finishing with the biggest World of Sport legend.",  
        "questions": \[  
          {  
            "step": 0,  
            "category": "Animation",  
            "questionText": "Who is Danger Mouse's cowardly, spectacle-wearing hamster sidekick who famously lives with him in a red pillar box on London's Baker Street?",  
            "answer": "Penfold",  
            "acceptedVariants": \["Ernest Penfold"\],  
            "points": 1  
          },  
          {  
            "step": 1,  
            "category": "Video Games",  
            "questionText": "Penfold is voiced by David Jason in the 1981 series, who also voiced Toad in The Wind in the Willows. Toad's reckless love of driving links us to what classic 1997 UK-developed action game by Dundee's DMA Design, where players hijack cars and run missions?",  
            "answer": "Grand Theft Auto",  
            "acceptedVariants": \["GTA", "Grand Theft Auto 1"\],  
            "points": 1  
          },  
          {  
            "step": 2,  
            "category": "Pro Wrestling",  
            "questionText": "DMA Design later became Rockstar North, based in Edinburgh. Just down the motorway in northern England, which legendary British professional wrestler, known for his signature blue-and-red singlet and 'easy, easy' chant, dominated ITV's World of Sport?",  
            "answer": "Big Daddy",  
            "acceptedVariants": \["Shirley Crabtree"\],  
            "points": 1  
          }  
        \],  
        "listQuestion": {  
          "enabled": true,  
          "listCategory": "Video Games",  
          "promptText": "Name 4 of the 6 fictional cities that serve as locations across the main Grand Theft Auto video game series.",  
          "correctItems": \["Liberty City", "Vice City", "Los Santos", "San Fierro", "Las Venturas", "Carcer City"\],  
          "requiredToPass": 4,  
          "points": 3  
        }  
      }  
    \]  
  },  
  {  
    "deckId": "robots-and-rebel-01",  
    "deckName": "Sparks & Sledgehammers",  
    "deckDescription": "Global mechanical titans, tactical gameplay systems, and high-impact weapons of choice.",  
    "cards": \[  
      {  
        "cardId": "mech-chain-001",  
        "parentTheme": "A Taste of Iron",  
        "bridgeLinkExplanation": "Bridges from an iconic metallic giant to a game featuring a literal iron fortress, leading to a legendary superstar who wields an iron sledgehammer.",  
        "questions": \[  
          {  
            "step": 0,  
            "category": "Animation",  
            "questionText": "Directed by Brad Bird, what 1999 animated sci-fi film tells the story of a young boy named Hogarth Hughes who befriends a massive metal robot from outer space?",  
            "answer": "The Iron Giant",  
            "acceptedVariants": \["Iron Giant"\],  
            "points": 1  
          },  
          {  
            "step": 1,  
            "category": "Video Games",  
            "questionText": "The Iron Giant was voiced by Vin Diesel. Which tactical 1990s real-time computer strategy game series from Westwood Studios tasks players with commanding the Global Defense Initiative against the Brotherhood of Nod?",  
            "answer": "Command & Conquer",  
            "acceptedVariants": \["C\&C", "Command and Conquer"\],  
            "points": 1  
          },  
          {  
            "step": 2,  
            "category": "Pro Wrestling",  
            "questionText": "Westwood's Command & Conquer franchise features a faction known as NOD. If you reverse the spelling to DON, we reach 'The King of Kings', Triple H. What is the real, legal first and last name of this legendary WWE superstar?",  
            "answer": "Paul Levesque",  
            "acceptedVariants": \["Paul Michael Levesque"\],  
            "points": 1  
          }  
        \],  
        "listQuestion": {  
          "enabled": false,  
          "listCategory": "Animation",  
          "promptText": "",  
          "correctItems": \[\],  
          "requiredToPass": 0,  
          "points": 0  
        }  
      }  
    \]  
  }  
\]

### **5\. Component Blueprints**

Copy-paste these interface structures into Jules to define how individual screens render.

#### **5.1 LobbyHub.tsx (Screen 1\)**

* **Role:** Sets player team names, binds selected default decks, and configures game options (such as standard countdown times).  
* **State Hook Ingestion:**  
  // Jules: Hook this component directly into your useGameStore.  
  const { startMatch, defaultDecks } \= useGameStore();

* **Visual Styling:** Large typography, prominent neon-magenta and neon-cobalt team player cards, and an interactive grid highlighting available themed decks.

#### **5.2 ArenaBoard.tsx (Screen 2\)**

* **Role:** The core game-board engine. Displays active pipelines, manages countdowns, and coordinates reveal states.  
* **UI Features:**  
  * **Link Pipeline Visualiser:** A horizontal map showing categories.  
    * Active item glows dynamically with active team styling.  
    * Completed steps turn a solid glowing emerald.  
  * **Masked Answer Box:** The answer is concealed behind a blurred CSS class (filter blur-md hover:blur-none cursor-pointer transition-all duration-300) which host hover/tapping reveals instantly.  
  * **The Control Panel:** Large interactive action buttons for Host controls:  
    * Correct (Award \+1 Point)  
    * Missed (Initiate 5s Steal Window)  
    * Toggle Red Card Intermission

#### **5.3 RedCardModal.tsx (Screen 3\)**

* **Role:** A screen overlay triggered whenever rules debate halts play.  
* **Layout:** Full screen deep red backdrop (bg-red-900/95 backdrop-blur-md). Displays a large referee whistle illustration and an official warning card:  
  * **Header:** "FROZEN BOARD: REFEREE INTERCESSION"  
  * **Selection Details:** Displays details from the "Referee's Red Cards" dictionary depending on which button was pressed (e.g., *Red Card 15: The Semantics Shield*).  
  * **Dismiss Action:** Large emerald "Release Board & Resume Play" button that restores active timers.

#### **5.4 SummaryPodium.tsx (Screen 4\)**

* **Role:** Ends match, ranks points, displays podium with confetti graphics, and offers play-again routing.

### **6\. Google Jules AI Integration Strategy**

To guide Jules smoothly through implementing this codebase, follow this sequential execution playbook.

┌──────────────────────────────────────┐  
│  STEP 1: Initialize Workspace        │ \-\> Provide Sections 1 & 2 configs  
└──────────────────┬───────────────────┘  
                   │  
                   ▼  
┌──────────────────────────────────────┐  
│  STEP 2: Build Base Definitions      │ \-\> Inject TS Schemas (Section 3\)  
└──────────────────┬───────────────────┘  
                   │  
                   ▼  
┌──────────────────────────────────────┐  
│  STEP 3: Implement Game Logic        │ \-\> Write Zustand / Hook engine  
└──────────────────┬───────────────────┘  
                   │  
                   ▼  
┌──────────────────────────────────────┐  
│  STEP 4: Assemble & Polish Views     │ \-\> Render screens & CSS animations  
└──────────────────────────────────────┘

#### **Phase 1: Project Setup Prompt**

"Hello Jules. We are building the Proof of Concept for 'Always A (Trivial) Triple Threat' (A3T), an interactive tabletop-companion quiz application. Based on the workspace backbone, please create the basic folder tree. Write the configuration files: tailwind.config.js with the custom deep slate-blue and hot-pink/cobalt theme colors, tsconfig.json with strict parameters, and import the Tailwind CSS directives inside src/index.css."

#### **Phase 2: Data Models & Mock Databases**

"Great job, Jules. Now create src/types/game.ts using the TypeScript specification sheet in Section 3 of our backbone document. Once compiled, populate src/data/defaultDecks.json with the JSON seed data, making sure the UK-themed deck and the sparks deck are fully represented with their category links and list criteria."

#### **Phase 3: Centralized Game State Machine Hook**

"Let's code the game controller hooks. In src/hooks/useGameStore.ts, implement a React-friendly State Machine or custom hook to manage game progress. This state machine must handle changing screens, scoring points, switching active turns between Team A and Team B, managing countdown timers, revealing questions, and storing which Red Card modal is active. Keep the interface simple and fully typed."

#### **Phase 4: Component Assembly and Visual Polish**

"Excellent. Now write the individual user interface files under src/components/: LobbyHub, ArenaBoard, RedCardModal, and SummaryPodium. Use Tailwind CSS styling for a professional arcade feel. Ensure the questions display clearly and answers are hidden behind a hoverable blur filter to prevent cheating. Anchor the 4 Red Card buttons to the footer of the active game board so the host can pause the match and display the rules instantly."