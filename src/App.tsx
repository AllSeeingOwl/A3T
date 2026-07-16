import React, { Suspense, lazy } from 'react';
import { useGameStore } from './hooks/useGameStore';
import { RedCardModal } from './components/RedCardModal';
import { RedCardGuide } from './components/RedCardGuide';

// ⚡ Bolt Optimization: Implement route-level code splitting using React.lazy
// This reduces the initial bundle size by loading screen components only when needed,
// rather than shipping the entire application code upfront.
const LobbyHub = lazy(() => import('./components/LobbyHub').then(m => ({ default: m.LobbyHub })));
const ArenaBoard = lazy(() => import('./components/ArenaBoard').then(m => ({ default: m.ArenaBoard })));
const SummaryPodium = lazy(() => import('./components/SummaryPodium').then(m => ({ default: m.SummaryPodium })));
const TiebreakerScreen = lazy(() => import('./components/TiebreakerScreen').then(m => ({ default: m.TiebreakerScreen })));

export const App: React.FC = () => {
  // ⚡ Bolt Optimization: Subscribe only to currentScreen.
  // By delegating activeRedCard to the RedCardModal itself, we prevent the entire App
  // (and thus the heavy ArenaBoard) from re-rendering when a Red Card is issued or cleared.
  const currentScreen = useGameStore((state) => state.currentScreen);

  return (
    <div className="w-full min-h-screen">
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-arena-slate font-display text-white text-2xl uppercase tracking-widest">Loading...</div>}>
        {currentScreen === 'LOBBY' && <LobbyHub />}
        {currentScreen === 'ARENA' && <ArenaBoard />}
        {currentScreen === 'SUMMARY' && <SummaryPodium />}
        {currentScreen === 'TIEBREAKER' && <TiebreakerScreen />}
      </Suspense>

      {/* Kept RedCardModal eager to avoid replacing the entire screen with a loading state when triggered */}
      <RedCardModal />

      {/* Global Red Card Guide Panel */}
      <RedCardGuide />
    </div>
  );
};
