import React, { Suspense, lazy } from 'react';
import { useGameStore } from './hooks/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { RedCardModal } from './components/RedCardModal';

// ⚡ Bolt Optimization: Implement route-level code splitting using React.lazy
// This reduces the initial bundle size by loading screen components only when needed,
// rather than shipping the entire application code upfront.
const LobbyHub = lazy(() => import('./components/LobbyHub').then(m => ({ default: m.LobbyHub })));
const ArenaBoard = lazy(() => import('./components/ArenaBoard').then(m => ({ default: m.ArenaBoard })));
const SummaryPodium = lazy(() => import('./components/SummaryPodium').then(m => ({ default: m.SummaryPodium })));

export const App: React.FC = () => {
  // ⚡ Bolt Optimization: Wrap Zustand selector in useShallow to prevent unnecessary re-renders
  // when unrelated state changes (like the active timer counting down).
  const { currentScreen, activeRedCard } = useGameStore(
    useShallow((state) => ({
      currentScreen: state.currentScreen,
      activeRedCard: state.activeRedCard,
    }))
  );

  return (
    <div className="w-full min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-arena-slate font-display text-white text-2xl uppercase tracking-widest">Loading...</div>}>
        {currentScreen === 'LOBBY' && <LobbyHub />}
        {currentScreen === 'ARENA' && <ArenaBoard />}
        {currentScreen === 'SUMMARY' && <SummaryPodium />}
      </Suspense>

      {/* Kept RedCardModal eager to avoid replacing the entire screen with a loading state when triggered */}
      {activeRedCard && <RedCardModal />}
    </div>
  );
};
