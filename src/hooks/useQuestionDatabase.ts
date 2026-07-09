import { create } from 'zustand';
import { DatabaseQuestion, parseDatabaseCSV } from '../utils/questionParser';
import { Category } from '../types/game';

interface QuestionDatabaseState {
  questions: DatabaseQuestion[];
  isLoaded: boolean;

  // ⚡ Bolt Optimization: Add O(1) indices for fast lookups
  domainIndex: Map<string, DatabaseQuestion[]>;
  deckIndex: Map<string, DatabaseQuestion[]>;

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
  domainIndex: new Map(),
  deckIndex: new Map(),

  loadQuestions: (csvData: string) => {
    const parsed = parseDatabaseCSV(csvData);

    // ⚡ Bolt Optimization: Pre-compute Map indices during data ingestion
    // This reduces O(n) filter operations to O(1) lookups.
    const domainIndex = new Map<string, DatabaseQuestion[]>();
    const deckIndex = new Map<string, DatabaseQuestion[]>();

    for (const q of parsed) {
      if (!domainIndex.has(q.category)) domainIndex.set(q.category, []);
      domainIndex.get(q.category)!.push(q);

      if (!deckIndex.has(q.normalizedDeckTheme)) deckIndex.set(q.normalizedDeckTheme, []);
      deckIndex.get(q.normalizedDeckTheme)!.push(q);
    }

    set({ questions: parsed, domainIndex, deckIndex, isLoaded: true });
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
    // ⚡ Bolt Optimization: Use O(1) map lookup instead of O(n) array filter
    return state.domainIndex.get(domain) || [];
  },

  getQuestionsByDeck: (deckName: string) => {
    const state = get();
    // ⚡ Bolt Optimization: Use O(1) map lookup instead of O(n) array filter
    return state.deckIndex.get(deckName.toLowerCase()) || [];
  },

  getTotalQuestionsCount: () => {
    return get().questions.length;
  }
}));
