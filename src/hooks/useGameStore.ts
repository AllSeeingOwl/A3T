import { create } from 'zustand';
import { GameState, ScreenState, QuestionStep, Deck } from '../types/game';
import defaultDecksData from '../data/defaultDecks.json';

// Type assertion for the imported JSON
const defaultDecks = defaultDecksData as Deck[];

interface GameActions {
  startMatch: (deck: Deck, teamAName: string, teamBName: string) => void;
  setScreen: (screen: ScreenState) => void;
  addScore: (team: 'teamA' | 'teamB', points: number) => void;
  switchTurn: () => void;
  setTimerSeconds: (seconds: number) => void;
  setTimerActive: (active: boolean) => void;
  decrementTimer: () => void;
  setQuestionStage: (stage: GameState['questionStage']) => void;
  setActiveRedCard: (card: GameState['activeRedCard']) => void;
  setEasyModeTeam: (team: GameState['easyModeTeam']) => void;
  nextStep: () => void;
  nextCard: () => void;
  endGame: () => void;
  resetGame: () => void;
}

export type GameStore = GameState & GameActions & { defaultDecks: Deck[] };

const initialState: GameState = {
  currentScreen: 'LOBBY',
  teams: {
    teamA: { name: 'Team A', score: 0 },
    teamB: { name: 'Team B', score: 0 },
  },
  activeTeam: 'teamA',
  selectedDeck: null,
  currentCardIndex: 0,
  currentStepIndex: 0,
  questionStage: 'HIDDEN',
  timerSeconds: 0,
  timerActive: false,
  activeRedCard: null,
  easyModeTeam: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  defaultDecks,

  startMatch: (deck, teamAName, teamBName) =>
    set({
      currentScreen: 'ARENA',
      selectedDeck: deck,
      teams: {
        teamA: { name: teamAName || 'Team A', score: 0 },
        teamB: { name: teamBName || 'Team B', score: 0 },
      },
      currentCardIndex: 0,
      currentStepIndex: 0,
      questionStage: 'HIDDEN',
      timerSeconds: 0,
      timerActive: false,
      activeRedCard: null,
      easyModeTeam: null,
      activeTeam: 'teamA',
    }),

  setScreen: (screen) => set({ currentScreen: screen }),

  addScore: (team, points) =>
    set((state) => ({
      teams: {
        ...state.teams,
        [team]: {
          ...state.teams[team],
          score: state.teams[team].score + points,
        },
      },
    })),

  switchTurn: () =>
    set((state) => ({
      activeTeam: state.activeTeam === 'teamA' ? 'teamB' : 'teamA',
    })),

  setTimerSeconds: (seconds) => set({ timerSeconds: seconds }),

  setTimerActive: (active) => set({ timerActive: active }),

  decrementTimer: () =>
    set((state) => {
      const newSeconds = Math.max(0, state.timerSeconds - 1);
      if (newSeconds === 0 && state.timerSeconds > 0) {
        return {
          timerSeconds: 0,
          timerActive: false,
          questionStage: 'REVEALED_ANSWER',
        };
      }
      return { timerSeconds: newSeconds };
    }),

  setQuestionStage: (stage) => set({ questionStage: stage }),

  setActiveRedCard: (card) => set({ activeRedCard: card }),

  setEasyModeTeam: (team) => set({ easyModeTeam: team }),

  nextStep: () =>
    set((state) => {
      if (state.currentStepIndex < 2) {
        const nextStepIndex = (state.currentStepIndex + 1) as QuestionStep;
        return {
          currentStepIndex: nextStepIndex,
          questionStage: 'HIDDEN',
          easyModeTeam: null,
        };
      }

      // If we are at step 2, check for list question
      if (state.selectedDeck) {
        const currentCard = state.selectedDeck.cards[state.currentCardIndex];
        if (currentCard && currentCard.listQuestion && currentCard.listQuestion.enabled) {
          return {
            questionStage: 'LIST_ACTIVE',
            easyModeTeam: null,
          };
        }
      }
      return { easyModeTeam: null };
    }),

  nextCard: () =>
    set((state) => {
      if (state.selectedDeck && state.currentCardIndex + 1 < state.selectedDeck.cards.length) {
        return {
          currentCardIndex: state.currentCardIndex + 1,
          currentStepIndex: 0,
          questionStage: 'HIDDEN',
          easyModeTeam: null,
        };
      }
      // Out of cards -> End game
      return { currentScreen: 'SUMMARY', easyModeTeam: null };
    }),

  endGame: () => set({ currentScreen: 'SUMMARY' }),

  resetGame: () => set(initialState),
}));
