import React from 'react';
import { useGameStore } from '../hooks/useGameStore';

export const ArenaBoard: React.FC = () => {
  const {
    teams,
    activeTeam,
    selectedDeck,
    currentCardIndex,
    currentStepIndex,
    questionStage,
    timerSeconds,
    addScore,
    switchTurn,
    nextStep,
    nextCard,
    setQuestionStage,
    setActiveRedCard,
    setTimerSeconds,
    setTimerActive
  } = useGameStore();

  const activeCard = selectedDeck?.cards[currentCardIndex];
  const activeQuestion = activeCard?.questions[currentStepIndex];

  if (!activeCard || !activeQuestion) {
    return <div className="text-white p-8">Loading or Error loading card...</div>;
  }

  const handleCorrect = () => {
    addScore(activeTeam, activeQuestion.points);
    if (currentStepIndex === 2) {
      // Completed the chain
      nextCard();
    } else {
      nextStep();
    }
  };

  const handleMissed = () => {
    // Initiate steal window
    setQuestionStage('STEAL_WINDOW');
    switchTurn();
    setTimerSeconds(5);
    setTimerActive(true);
  };

  const handleRedCard = (type: 'KAYFABE' | 'VFX' | 'MUPPET' | 'SEMANTICS') => {
    setActiveRedCard(type);
  };

  const renderPipeline = () => {
    return (
      <div className="flex justify-center items-center gap-4 mb-8">
        {activeCard.questions.map((q, idx) => {
          const isCompleted = currentStepIndex > idx;
          const isActive = currentStepIndex === idx;
          let baseClass = "px-6 py-2 rounded-full border-2 font-display text-lg uppercase transition-all duration-300";

          if (isCompleted) {
             baseClass += " bg-emerald-600 border-emerald-400 text-white shadow-[0_0_10px_rgba(16,185,129,0.8)]";
          } else if (isActive) {
             const teamColor = activeTeam === 'teamA' ? 'border-arena-magenta shadow-[0_0_10px_rgba(236,72,153,0.8)]' : 'border-arena-cobalt shadow-[0_0_10px_rgba(59,130,246,0.8)]';
             baseClass += ` bg-arena-navy text-white ${teamColor} scale-110`;
          } else {
             baseClass += " bg-arena-slate border-slate-600 text-slate-400 opacity-50";
          }

          return (
            <div key={idx} className="flex items-center">
              <div className={baseClass}>
                {q.category}
              </div>
              {idx < 2 && (
                <div className="w-8 h-1 bg-slate-600 mx-2" />
              )}
            </div>
          )
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-arena-slate font-sans relative w-full">
      {/* Header / Scoreboard */}
      <div className="flex justify-between items-center p-6 bg-arena-navy border-b border-slate-700 shadow-lg">
        <div className={`p-4 rounded-lg flex flex-col items-center min-w-[200px] border-2 transition-all ${activeTeam === 'teamA' ? 'border-arena-magenta bg-arena-magenta/10 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'border-transparent'}`}>
          <h2 className="text-xl font-display text-arena-magenta uppercase">{teams.teamA.name}</h2>
          <span className="text-4xl font-display text-white">{teams.teamA.score}</span>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-display text-white uppercase tracking-widest mb-2">{selectedDeck?.deckName}</h1>
          <p className="text-arena-amber font-display text-xl">Theme: {activeCard.parentTheme}</p>
        </div>

        <div className={`p-4 rounded-lg flex flex-col items-center min-w-[200px] border-2 transition-all ${activeTeam === 'teamB' ? 'border-arena-cobalt bg-arena-cobalt/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-transparent'}`}>
          <h2 className="text-xl font-display text-arena-cobalt uppercase">{teams.teamB.name}</h2>
          <span className="text-4xl font-display text-white">{teams.teamB.score}</span>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-8">

        {renderPipeline()}

        {/* Question Card */}
        <div className="w-full max-w-4xl bg-arena-navy rounded-2xl p-8 border border-slate-600 shadow-2xl relative mb-8">

          <div className="absolute top-0 right-0 p-4">
             {questionStage === 'STEAL_WINDOW' && (
                <div className="text-4xl font-display text-arena-amber animate-pulse">
                   STEAL: {timerSeconds}s
                </div>
             )}
          </div>

          <h3 className="text-2xl font-display text-slate-400 mb-4 uppercase">
            Question {currentStepIndex + 1}
          </h3>
          <p className="text-3xl text-white font-medium mb-8 leading-relaxed">
            {activeQuestion.questionText}
          </p>

          <div
            tabIndex={0}
            role="button"
            aria-label="Reveal Answer"
            className="bg-arena-slate p-6 rounded-xl border border-slate-700 mt-8 relative group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-magenta"
          >
             <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md group-hover:backdrop-blur-none group-focus:backdrop-blur-none transition-all duration-300 flex items-center justify-center z-10 group-hover:opacity-0 group-focus:opacity-0 cursor-pointer">
                <span className="text-slate-400 font-display uppercase tracking-widest flex items-center gap-2">
                   Hover or Focus to Reveal Answer
                </span>
             </div>
             <div className="text-center">
                <span className="text-sm text-slate-500 uppercase tracking-wider block mb-2">Answer</span>
                <span className="text-4xl font-display text-emerald-400">{activeQuestion.answer}</span>
                {activeQuestion.acceptedVariants.length > 0 && (
                   <p className="text-sm text-slate-400 mt-2">
                      Also accept: {activeQuestion.acceptedVariants.join(', ')}
                   </p>
                )}
             </div>
          </div>
        </div>

        {/* Host Controls */}
        <div className="flex gap-6 mt-4 mb-20">
          <button
            onClick={handleCorrect}
            className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-display text-xl uppercase tracking-wider transition-all shadow-lg"
          >
            Correct (+{activeQuestion.points})
          </button>
          <button
            onClick={handleMissed}
            className="px-10 py-4 bg-slate-600 hover:bg-slate-500 text-white rounded-lg font-display text-xl uppercase tracking-wider transition-all shadow-lg"
          >
            Missed / Steal
          </button>
        </div>
      </div>

      {/* Footer - Red Cards */}
      <div className="bg-arena-navy border-t border-slate-700 p-4 fixed bottom-0 w-full flex justify-center gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] z-20">
        <button onClick={() => handleRedCard('KAYFABE')} className="px-6 py-2 bg-arena-crimson/20 hover:bg-arena-crimson/40 border border-arena-crimson text-arena-crimson rounded font-display uppercase transition-colors">
          Kayfabe
        </button>
        <button onClick={() => handleRedCard('VFX')} className="px-6 py-2 bg-arena-crimson/20 hover:bg-arena-crimson/40 border border-arena-crimson text-arena-crimson rounded font-display uppercase transition-colors">
          VFX
        </button>
        <button onClick={() => handleRedCard('MUPPET')} className="px-6 py-2 bg-arena-crimson/20 hover:bg-arena-crimson/40 border border-arena-crimson text-arena-crimson rounded font-display uppercase transition-colors">
          Muppet
        </button>
        <button onClick={() => handleRedCard('SEMANTICS')} className="px-6 py-2 bg-arena-crimson/20 hover:bg-arena-crimson/40 border border-arena-crimson text-arena-crimson rounded font-display uppercase transition-colors">
          Semantics
        </button>
      </div>

    </div>
  );
};
