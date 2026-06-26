import React from 'react';
import { useGameStore } from './hooks/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { LobbyHub } from './components/LobbyHub';
import { ArenaBoard } from './components/ArenaBoard';
import { RedCardModal } from './components/RedCardModal';
import { SummaryPodium } from './components/SummaryPodium';

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
      {currentScreen === 'LOBBY' && <LobbyHub />}
      {currentScreen === 'ARENA' && <ArenaBoard />}
      {currentScreen === 'SUMMARY' && <SummaryPodium />}

      {activeRedCard && <RedCardModal />}
    </div>
  );
};
