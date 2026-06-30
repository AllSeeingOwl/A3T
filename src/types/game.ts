export type Category = 'Animation' | 'Video Games' | 'Pro Wrestling';
export type ScreenState = 'LOBBY' | 'ARENA' | 'SUMMARY';
export type QuestionStep = 0 | 1 | 2; // 0 = Quest 1, 1 = Quest 2, 2 = Quest 3

export interface Question {
  step: QuestionStep;
  category: Category;
  questionText: string;
  answer: string;
  acceptedVariants: string[];
  points: number;
}

export interface ListQuestion {
  enabled: boolean;
  listCategory: Category;
  promptText: string;
  correctItems: string[];
  requiredToPass: number;
  points: number;
}

export interface ChainCard {
  cardId: string;
  parentTheme: string;
  bridgeLinkExplanation: string;
  questions: [Question, Question, Question];
  listQuestion: ListQuestion;
}

export interface Deck {
  _comment?: string;
  deckId: string;
  deckName: string;
  deckDescription: string;
  cards: ChainCard[];
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
  questionStage: 'HIDDEN' | 'REVEALED_QUESTION' | 'REVEALED_ANSWER' | 'STEAL_WINDOW' | 'LIST_ACTIVE' | 'LIST_REVEALED';
  timerSeconds: number;
  timerActive: boolean;
  activeRedCard: 'CATEGORY_VIOLATIONS' | 'MEDIUM_VIOLATIONS' | 'CANON_VIOLATIONS' | 'GAMEPLAY_VIOLATIONS' | 'REFEREE_TOOLS' | null;
}
