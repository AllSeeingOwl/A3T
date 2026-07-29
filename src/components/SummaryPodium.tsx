import React, { useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { useShallow } from 'zustand/react/shallow';

export const SummaryPodium: React.FC = () => {
  useEffect(() => {
    // ⚡ Bolt Optimization: Preload the TiebreakerScreen component in the background
    // while viewing the summary. This prevents the Suspense fallback flash
    // if the match is a tie and they transition to sudden death.
    import('./TiebreakerScreen').catch(() => {});
  }, []);

  // ⚡ Bolt Optimization: Wrap Zustand selector in useShallow so this component
  // only re-renders when the `teams` or `resetGame` state changes.
  const { teams, resetGame, setScreen } = useGameStore(
    useShallow((state) => ({
      teams: state.teams,
      resetGame: state.resetGame,
      setScreen: state.setScreen,
    }))
  );

  const winner = teams.teamA.score > teams.teamB.score ? teams.teamA :
                 teams.teamB.score > teams.teamA.score ? teams.teamB : null;

  const isTie = !winner;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-arena-slate font-sans p-8 w-full relative overflow-hidden">

      {/* Confetti / Celebration Background Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-arena-magenta rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-arena-cobalt rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-40 w-24 h-24 bg-arena-gold rounded-full blur-2xl animate-bounce" />
      </div>

      <h1 className="text-6xl font-display text-white mb-16 uppercase tracking-widest text-center drop-shadow-lg z-10">
        Final Results
      </h1>

      <div className="flex items-end justify-center gap-8 mb-16 h-80 z-10 w-full max-w-4xl">

        {/* Team A Podium */}
        <div className="flex flex-col items-center justify-end w-1/3">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-display text-arena-magenta uppercase">{teams.teamA.name}</h2>
            <span className="text-5xl font-display text-white">
              <span className="sr-only">Score: </span>
              {teams.teamA.score}
            </span>
          </div>
          <div className={`w-full bg-arena-magenta/80 rounded-t-lg border-2 border-arena-magenta shadow-[0_0_20px_rgba(236,72,153,0.4)] ${winner?.name === teams.teamA.name ? 'h-48' : 'h-32'}`}>
            <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent rounded-t-lg flex justify-center pt-4">
              <span className="text-4xl font-display text-white/50">
                <span className="sr-only">{winner?.name === teams.teamA.name ? '1st Place' : isTie ? 'Tie' : '2nd Place'}</span>
                <span aria-hidden="true">{winner?.name === teams.teamA.name ? '1' : isTie ? '-' : '2'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Winner Announcement Area */}
        <div className="flex flex-col items-center justify-start h-full pt-8 w-1/3">
          {isTie ? (
            <div className="text-center animate-pulse">
              <h3 className="text-4xl font-display text-arena-amber uppercase">It's a Tie!</h3>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-3xl font-display text-arena-gold mb-2 uppercase">Champions</h3>
              <p className="text-5xl font-display text-white drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">{winner.name}</p>
            </div>
          )}
        </div>

        {/* Team B Podium */}
        <div className="flex flex-col items-center justify-end w-1/3">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-display text-arena-cobalt uppercase">{teams.teamB.name}</h2>
            <span className="text-5xl font-display text-white">
              <span className="sr-only">Score: </span>
              {teams.teamB.score}
            </span>
          </div>
          <div className={`w-full bg-arena-cobalt/80 rounded-t-lg border-2 border-arena-cobalt shadow-[0_0_20px_rgba(59,130,246,0.4)] ${winner?.name === teams.teamB.name ? 'h-48' : 'h-32'}`}>
            <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent rounded-t-lg flex justify-center pt-4">
              <span className="text-4xl font-display text-white/50">
                <span className="sr-only">{winner?.name === teams.teamB.name ? '1st Place' : isTie ? 'Tie' : '2nd Place'}</span>
                <span aria-hidden="true">{winner?.name === teams.teamB.name ? '1' : isTie ? '-' : '2'}</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      <div className="flex gap-6 z-10">
        <button
          onClick={() => { if (window.confirm('Are you sure you want to return to the lobby? This will reset all current scores.')) { resetGame(); } }}
          className="px-12 py-4 bg-arena-navy hover:bg-slate-700 border-2 border-slate-500 text-white rounded-full font-display text-2xl uppercase tracking-wider transition-all hover:scale-105 shadow-lg focus-visible:ring-2 focus-visible:ring-white focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate"
        >
          Play Again
        </button>
        {isTie && (
          <button
            onClick={() => setScreen('TIEBREAKER')}
            className="px-12 py-4 bg-arena-amber hover:bg-amber-500 text-arena-navy rounded-full font-display text-2xl uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.5)] focus-visible:ring-2 focus-visible:ring-arena-amber focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate"
          >
            Initiate Tiebreaker
          </button>
        )}
      </div>

    </div>
  );
};
