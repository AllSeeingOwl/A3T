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
    // ⚡ Bolt Optimization: Hoist .toLowerCase() out of the filter callback and use pre-computed normalized strings
    // to avoid recalculating the lowercased strings for every question in the database during each filter pass.
    const targetDifficulty = difficulty.toLowerCase();
    return state.questions.filter(q =>
      q.normalizedDifficulty.includes(targetDifficulty)
    );
  },

  getQuestionsByDomain: (domain: Category) => {
    const state = get();
    return state.questions.filter(q => q.category === domain);
  },

  getQuestionsByDeck: (deckName: string) => {
    const state = get();
    // ⚡ Bolt Optimization: Hoist .toLowerCase() out of the filter callback and use pre-computed normalized strings
    // to avoid recalculating the lowercased strings for every question in the database during each filter pass.
    const targetDeckName = deckName.toLowerCase();
    return state.questions.filter(q =>
      q.normalizedDeckTheme === targetDeckName
    );
  },

  getTotalQuestionsCount: () => {
    return get().questions.length;
  }
}));
