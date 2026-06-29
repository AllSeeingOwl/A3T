import { create } from 'zustand';
import { DatabaseQuestion, parseDatabaseCSV } from '../utils/questionParser';
import { Category } from '../types/game';

interface QuestionDatabaseState {
  questions: DatabaseQuestion[];
  isLoaded: boolean;

  // Actions
  loadQuestions: (csvData: string) => void;
  getQuestionsByDifficulty: (difficulty: string) => DatabaseQuestion[];
  getQuestionsByDomain: (domain: Category) => DatabaseQuestion[];
  getQuestionsByDeck: (deckName: string) => DatabaseQuestion[];
  getTotalQuestionsCount: () => number;
}

export const useQuestionDatabase = create<QuestionDatabaseState>((set, get) => ({
  questions: [],
  isLoaded: false,

  loadQuestions: (csvData: string) => {
    const parsed = parseDatabaseCSV(csvData);
    set({ questions: parsed, isLoaded: true });
  },

  getQuestionsByDifficulty: (difficulty: string) => {
    const state = get();
    return state.questions.filter(q =>
      q.rawDifficulty.toLowerCase().includes(difficulty.toLowerCase())
    );
  },

  getQuestionsByDomain: (domain: Category) => {
    const state = get();
    return state.questions.filter(q => q.category === domain);
  },

  getQuestionsByDeck: (deckName: string) => {
    const state = get();
    return state.questions.filter(q =>
      q.deckTheme.toLowerCase() === deckName.toLowerCase()
    );
  },

  getTotalQuestionsCount: () => {
    return get().questions.length;
  }
}));
