import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';

export const LobbyHub: React.FC = () => {
  const { startMatch, defaultDecks } = useGameStore();
  const [teamAName, setTeamAName] = useState('Team A');
  const [teamBName, setTeamBName] = useState('Team B');
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  const handleStart = () => {
    const deck = defaultDecks.find((d) => d.deckId === selectedDeckId);
    if (deck) {
      // 🛡️ Sentinel: Sanitize and limit team names to prevent UI breaking and excessively large state
      const sanitizedTeamA = teamAName.trim().substring(0, 50) || 'Team 1';
      const sanitizedTeamB = teamBName.trim().substring(0, 50) || 'Team 2';
      startMatch(deck, sanitizedTeamA, sanitizedTeamB);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-arena-slate font-sans p-8 w-full">
      <h1 className="text-5xl font-display text-white mb-12 uppercase tracking-wider text-center drop-shadow-lg">
        Always A (Trivial) Triple Threat
      </h1>

      <div className="flex w-full max-w-4xl gap-8 mb-12">
        <div className="flex-1 bg-arena-navy p-6 rounded-xl border-t-4 border-arena-magenta shadow-lg flex flex-col">
          <h2 className="text-2xl font-display text-arena-magenta mb-4 uppercase">Team 1</h2>
          <input
            type="text"
            className="w-full bg-arena-slate text-white p-3 rounded border border-arena-navy focus:border-arena-magenta focus:outline-none text-xl"
            value={teamAName}
            onChange={(e) => setTeamAName(e.target.value)}
            placeholder="Enter Team Name"
            maxLength={50}
          />
        </div>

        <div className="flex-1 bg-arena-navy p-6 rounded-xl border-t-4 border-arena-cobalt shadow-lg flex flex-col">
          <h2 className="text-2xl font-display text-arena-cobalt mb-4 uppercase">Team 2</h2>
          <input
            type="text"
            className="w-full bg-arena-slate text-white p-3 rounded border border-arena-navy focus:border-arena-cobalt focus:outline-none text-xl"
            value={teamBName}
            onChange={(e) => setTeamBName(e.target.value)}
            placeholder="Enter Team Name"
            maxLength={50}
          />
        </div>
      </div>

      <div className="w-full max-w-4xl bg-arena-navy p-8 rounded-xl shadow-lg border border-slate-700">
        <h2 className="text-3xl font-display text-white mb-6 uppercase text-center">Select Deck</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultDecks.map((deck) => (
            <button
              key={deck.deckId}
              onClick={() => setSelectedDeckId(deck.deckId)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedDeckId === deck.deckId
                  ? 'border-arena-gold bg-arena-slate scale-105'
                  : 'border-slate-600 bg-arena-slate hover:border-slate-400'
              }`}
            >
              <h3 className="text-xl font-display text-white mb-2">{deck.deckName}</h3>
              <p className="text-sm text-slate-300">{deck.deckDescription}</p>
              <p className="text-xs text-slate-400 mt-2">{deck.cards.length} Chains</p>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleStart}
        disabled={!selectedDeckId}
        className={`mt-12 px-12 py-4 rounded-full text-2xl font-display uppercase tracking-widest transition-all ${
          selectedDeckId
            ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }`}
      >
        Start Match
      </button>
    </div>
  );
};
