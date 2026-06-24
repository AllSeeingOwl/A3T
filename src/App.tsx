import React from 'react';
import { useGameStore } from './hooks/useGameStore';
import { LobbyHub } from './components/LobbyHub';
import { ArenaBoard } from './components/ArenaBoard';
import { RedCardModal } from './components/RedCardModal';
import { SummaryPodium } from './components/SummaryPodium';

export const App: React.FC = () => {
  const { currentScreen, activeRedCard } = useGameStore();

  return (
    <div className="w-full min-h-screen">
      {currentScreen === 'LOBBY' && <LobbyHub />}
      {currentScreen === 'ARENA' && <ArenaBoard />}
      {currentScreen === 'SUMMARY' && <SummaryPodium />}

      {activeRedCard && <RedCardModal />}
    </div>
  );
};
