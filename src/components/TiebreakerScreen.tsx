import React, { useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { ShieldAlert } from 'lucide-react';

export const TiebreakerScreen: React.FC = () => {
  const { teams, addScore, endGame, selectedDeck } = useGameStore(
    useShallow((state) => ({
      teams: state.teams,
      addScore: state.addScore,
      endGame: state.endGame,
      selectedDeck: state.selectedDeck,
    }))
  );

  const [winnerDeclared, setWinnerDeclared] = useState(false);

  const handleWinner = (team: 'teamA' | 'teamB') => {
    // Add +1 to the winner to break the tie, then go back to summary
    addScore(team, 1);
    setWinnerDeclared(true);
    setTimeout(() => {
      endGame();
    }, 1500);
  };

  // Find a list question to show, or just give a generic prompt.
  // In a real scenario, we might want a specific tiebreaker list.
  const randomListQuestion = selectedDeck?.cards.find(c => c.listQuestion && c.listQuestion.enabled)?.listQuestion;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-arena-slate font-sans p-8 w-full">
      <div className="max-w-4xl w-full bg-arena-navy rounded-2xl p-12 border-4 border-arena-amber shadow-[0_0_50px_rgba(245,158,11,0.3)] relative overflow-hidden text-center">

        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none flex items-center justify-center">
          <ShieldAlert aria-hidden="true" className="w-96 h-96 text-arena-amber" />
        </div>

        <h1 className="text-6xl font-display text-white mb-4 uppercase tracking-widest relative z-10 drop-shadow-md">
          Sudden Death
        </h1>
        <h2 className="text-3xl font-display text-arena-amber mb-8 uppercase relative z-10">
          Tiebreaker Round
        </h2>

        <div className="bg-slate-800 p-8 rounded-xl border border-slate-600 mb-12 relative z-10 text-left">
          <h3 className="text-2xl font-display text-emerald-400 mb-4 uppercase">How to Play</h3>
          <p className="text-lg text-slate-300 mb-6">
            Both teams are tied! To determine the ultimate champion, the host will read the following List Question prompt.
            Teams will take turns naming valid answers one by one. The first team to give an incorrect answer, repeat an answer, or fail to answer within a reasonable time loses the tiebreaker.
          </p>

          <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
            <span className="text-sm text-slate-500 uppercase tracking-wider block mb-2">Prompt</span>
            <p className="text-2xl text-white font-medium">
              {randomListQuestion ? randomListQuestion.promptText : "Host Discretion: Ask teams to list as many items as possible from a chosen category until one team fails."}
            </p>
            {randomListQuestion && (
              <p className="mt-4 text-emerald-400 font-display text-lg">
                Accepted answers include: {randomListQuestion.correctItems.slice(0, 5).join(', ')} ...and more.
              </p>
            )}
          </div>
        </div>

        {!winnerDeclared ? (
          <div className="relative z-10">
            <h3 className="text-2xl font-display text-white mb-6 uppercase">Declare the Winner</h3>
            <div className="flex justify-center gap-8">
              <button
                onClick={() => handleWinner('teamA')}
                className="px-8 py-4 bg-arena-magenta/20 hover:bg-arena-magenta text-white border border-arena-magenta rounded-lg font-display text-2xl uppercase transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] focus-visible:ring-2 focus-visible:ring-arena-magenta focus:outline-none"
              >
                {teams.teamA.name} Wins
              </button>
              <button
                onClick={() => handleWinner('teamB')}
                className="px-8 py-4 bg-arena-cobalt/20 hover:bg-arena-cobalt text-white border border-arena-cobalt rounded-lg font-display text-2xl uppercase transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] focus-visible:ring-2 focus-visible:ring-arena-cobalt focus:outline-none"
              >
                {teams.teamB.name} Wins
              </button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 animate-pulse text-3xl font-display text-arena-gold uppercase">
            Winner Declared! Returning to Podium...
          </div>
        )}

      </div>
    </div>
  );
};
