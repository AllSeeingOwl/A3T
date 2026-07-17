import React, { useEffect, memo, useCallback } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { ChainCard, QuestionStep, Category } from '../types/game';

// Helper to map categories to accessible colors for the question cards
const getCategoryStyles = (category: Category) => {
  switch (category) {
    case 'Animation':
      return {
        border: 'border-cyan-500',
        shadow: 'shadow-[0_0_30px_rgba(6,182,212,0.2)]',
        badgeBg: 'bg-cyan-900 text-cyan-100 border border-cyan-500',
      };
    case 'Video Games':
      return {
        border: 'border-fuchsia-500',
        shadow: 'shadow-[0_0_30px_rgba(217,70,239,0.2)]',
        badgeBg: 'bg-fuchsia-900 text-fuchsia-100 border border-fuchsia-500',
      };
    case 'Pro Wrestling':
      return {
        border: 'border-rose-500',
        shadow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]',
        badgeBg: 'bg-rose-900 text-rose-100 border border-rose-500',
      };
    default:
      return {
        border: 'border-slate-600',
        shadow: 'shadow-2xl',
        badgeBg: 'bg-slate-700 text-slate-300 border border-slate-600',
      };
  }
};

// ⚡ Bolt Optimization: Extract fast-changing state into isolated components.
// This prevents the heavy ArenaBoard parent from re-rendering on every timer tick.
const StealTimer: React.FC = () => {
  const { questionStage, timerSeconds, decrementTimer, timerActive } = useGameStore(
    useShallow((state) => ({
      questionStage: state.questionStage,
      timerSeconds: state.timerSeconds,
      decrementTimer: state.decrementTimer,
      timerActive: state.timerActive,
    }))
  );

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timerActive) {
      interval = setInterval(() => {
        decrementTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, decrementTimer]);

  if (questionStage !== 'STEAL_WINDOW') return null;

  return (
    <div className="text-4xl font-display text-arena-amber animate-pulse">
      STEAL: {timerSeconds}s
    </div>
  );
};


// ⚡ Bolt Optimization: Extract and memoize the pipeline rendering
// The pipeline only needs to re-render when the active step or team changes.
// This prevents layout recalculations when unrelated state (like the steal timer) ticks.
interface PipelineProps {
  activeCard: ChainCard;
  currentStepIndex: QuestionStep;
  activeTeam: string;
}

const Pipeline = memo(({ activeCard, currentStepIndex, activeTeam }: PipelineProps) => {
  const totalQuestions = activeCard.questions.length;
  const questionsRemaining = totalQuestions - currentStepIndex - 1;

  return (
    <div className="flex flex-col items-center mb-8">
      <ol aria-label="Question progress" className="flex justify-center items-center gap-4">
        {activeCard.questions.map((q, idx: number) => {
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
            <li key={idx} className="flex items-center" aria-current={isActive ? "step" : undefined}>
              <div className={baseClass}>
                <span className="sr-only">
                  {isCompleted ? "Completed step: " : isActive ? "Current step: " : "Pending step: "}
                </span>
                {q.category}
              </div>
              {idx < totalQuestions - 1 && (
                <div aria-hidden="true" className="w-8 h-1 bg-slate-600 mx-2" />
              )}
            </li>
          )
        })}
      </ol>
      <p className="mt-4 text-slate-400 font-display text-sm tracking-widest uppercase">
        {questionsRemaining > 0 ? `${questionsRemaining} Link${questionsRemaining > 1 ? 's' : ''} Remaining in Chain` : "Final Link in Chain"}
      </p>
    </div>
  );
});


// ⚡ Bolt Optimization: Extract and memoize the static Red Card footer controls.
// This prevents these static 5 buttons from re-rendering every time the active team,
// question step, or timer ticks, isolating state subscriptions to just what's needed.
// ⚡ Bolt Optimization: Extract and memoize ScoreboardHeader
// This prevents the heavy top navigation bar (which contains active transitions,
// shadows, and team layouts) from unnecessarily re-rendering whenever the game's
// questionStage changes, currentStepIndex increments, or the easy mode modal is toggled.
interface ScoreboardHeaderProps {
  teams: { teamA: { name: string; score: number }; teamB: { name: string; score: number } };
  activeTeam: 'teamA' | 'teamB';
  deckName?: string;
  parentTheme: string;
  onEndGame: () => void;
  chainsRemaining: number;
}

const ScoreboardHeader = memo(({ teams, activeTeam, deckName, parentTheme, onEndGame, chainsRemaining }: ScoreboardHeaderProps) => {
  return (
    <div className="relative flex justify-between items-center p-6 bg-arena-navy border-b border-slate-700 shadow-lg">
      <div
        aria-live="polite"
        aria-atomic="true"
        className={`p-4 rounded-lg flex flex-col items-center min-w-[200px] border-2 transition-all ${activeTeam === 'teamA' ? 'border-arena-magenta bg-arena-magenta/10 shadow-[0_0_15px_rgba(236,72,153,0.3)]' : 'border-transparent'}`}
      >
        <h2 className="text-xl font-display text-arena-magenta uppercase">
          {teams.teamA.name}
          {activeTeam === 'teamA' && <span className="sr-only"> (Current Turn)</span>}
        </h2>
        <span className="text-4xl font-display text-white">
          <span className="sr-only">Score: </span>
          {teams.teamA.score}
        </span>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-display text-white uppercase tracking-widest mb-2">{deckName}</h1>
        <p className="text-arena-amber font-display text-xl">Theme: {parentTheme}</p>
        <p className="text-slate-400 font-display text-sm mt-1">{chainsRemaining} Chain{chainsRemaining !== 1 ? 's' : ''} Remaining</p>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        className={`p-4 rounded-lg flex flex-col items-center min-w-[200px] border-2 transition-all ${activeTeam === 'teamB' ? 'border-arena-cobalt bg-arena-cobalt/10 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-transparent'}`}
      >
        <h2 className="text-xl font-display text-arena-cobalt uppercase">
          {teams.teamB.name}
          {activeTeam === 'teamB' && <span className="sr-only"> (Current Turn)</span>}
        </h2>
        <span className="text-4xl font-display text-white">
          <span className="sr-only">Score: </span>
          {teams.teamB.score}
        </span>
      </div>
      <button
        onClick={() => { if (window.confirm('Are you sure you want to finish the match early? This action cannot be undone.')) { onEndGame(); } }}
        aria-label="End Game and View Summary"
        className="absolute bottom-0 translate-y-1/2 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-300 rounded-full font-display uppercase text-xs tracking-wider transition-colors shadow-md focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none z-10"
      >
        Finish Match
      </button>
    </div>
  );
});
ScoreboardHeader.displayName = 'ScoreboardHeader';

const RedCardFooter = memo(() => {
  const { setActiveRedCard } = useGameStore(
    useShallow((state) => ({
      setActiveRedCard: state.setActiveRedCard,
    }))
  );

  const handleRedCard = (type: 'CATEGORY_VIOLATIONS' | 'MEDIUM_VIOLATIONS' | 'CANON_VIOLATIONS' | 'GAMEPLAY_VIOLATIONS' | 'REFEREE_TOOLS') => {
    setActiveRedCard(type);
  };

  return (
    <section aria-label="Red Card Controls" className="bg-arena-navy border-t border-slate-700 p-4 fixed bottom-0 w-full flex flex-wrap justify-center gap-4 shadow-[0_-10px_20px_rgba(0,0,0,0.3)] z-20">
      <button aria-label="Issue Category Violation Red Card" onClick={() => handleRedCard('CATEGORY_VIOLATIONS')} className="px-6 py-2 bg-arena-crimson/20 hover:bg-arena-crimson/40 border border-arena-crimson text-arena-crimson rounded font-display uppercase transition-colors focus-visible:ring-2 focus-visible:ring-arena-crimson focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate">
        Category
      </button>
      <button aria-label="Issue Medium Violation Red Card" onClick={() => handleRedCard('MEDIUM_VIOLATIONS')} className="px-6 py-2 bg-arena-crimson/20 hover:bg-arena-crimson/40 border border-arena-crimson text-arena-crimson rounded font-display uppercase transition-colors focus-visible:ring-2 focus-visible:ring-arena-crimson focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate">
        Medium
      </button>
      <button aria-label="Issue Canon Violation Red Card" onClick={() => handleRedCard('CANON_VIOLATIONS')} className="px-6 py-2 bg-arena-crimson/20 hover:bg-arena-crimson/40 border border-arena-crimson text-arena-crimson rounded font-display uppercase transition-colors focus-visible:ring-2 focus-visible:ring-arena-crimson focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate">
        Canon
      </button>
      <button aria-label="Issue Gameplay Violation Red Card" onClick={() => handleRedCard('GAMEPLAY_VIOLATIONS')} className="px-6 py-2 bg-arena-crimson/20 hover:bg-arena-crimson/40 border border-arena-crimson text-arena-crimson rounded font-display uppercase transition-colors focus-visible:ring-2 focus-visible:ring-arena-crimson focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate">
        Gameplay
      </button>
      <button aria-label="Open Referee Tools" onClick={() => handleRedCard('REFEREE_TOOLS')} className="px-6 py-2 bg-arena-crimson/20 hover:bg-arena-crimson/40 border border-amber-500 text-amber-500 rounded font-display uppercase transition-colors focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate">
        Referee Tools
      </button>
    </section>
  );
});
RedCardFooter.displayName = 'RedCardFooter';

export const ArenaBoard: React.FC = () => {

  // ⚡ Bolt Optimization: Wrap Zustand selector in useShallow to strictly subscribe
  // only to the requested fields. This prevents ArenaBoard from re-rendering
  // when other unused global state properties change.
  const {
    teams,
    activeTeam,
    selectedDeck,
    currentCardIndex,
    currentStepIndex,
    questionStage,
    addScore,
    switchTurn,
    nextStep,
    nextCard,
    endGame,
    setQuestionStage,
    setTimerSeconds,
    setTimerActive,
    easyModeTeam,
    setEasyModeTeam,
  } = useGameStore(
    useShallow((state) => ({
      teams: state.teams,
      activeTeam: state.activeTeam,
      selectedDeck: state.selectedDeck,
      currentCardIndex: state.currentCardIndex,
      currentStepIndex: state.currentStepIndex,
      questionStage: state.questionStage,
      addScore: state.addScore,
      switchTurn: state.switchTurn,
      nextStep: state.nextStep,
      nextCard: state.nextCard,
      endGame: state.endGame,
      setQuestionStage: state.setQuestionStage,
      setTimerSeconds: state.setTimerSeconds,
      setTimerActive: state.setTimerActive,
      easyModeTeam: state.easyModeTeam,
      setEasyModeTeam: state.setEasyModeTeam,
    }))
  );

  const [showEasyModal, setShowEasyModal] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showEasyModal) {
        setShowEasyModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEasyModal]);

  const activeCard = selectedDeck?.cards[currentCardIndex];
  const activeQuestion = activeCard?.questions[currentStepIndex];
  const chainsRemaining = selectedDeck ? selectedDeck.cards.length - currentCardIndex - 1 : 0;



  const handleCorrect = useCallback(() => {
    if (!activeQuestion) return;
    addScore(activeTeam, activeQuestion.points);
    if (currentStepIndex === 2) {
      if (activeCard?.listQuestion && activeCard.listQuestion.enabled) {
        nextStep();
      } else {
        nextCard();
      }
    } else {
      nextStep();
    }
  }, [addScore, activeTeam, activeQuestion, currentStepIndex, activeCard, nextStep, nextCard]);

  const handleMissedOrNext = useCallback(() => {
    if (questionStage === 'REVEALED_ANSWER') {
      if (currentStepIndex === 2) {
        nextCard();
      } else {
        nextStep();
      }
    } else if (questionStage === 'STEAL_WINDOW') {
      setTimerSeconds(0);
      setTimerActive(false);
      setQuestionStage('REVEALED_ANSWER');
    } else {
      setQuestionStage('STEAL_WINDOW');
      switchTurn();
      setTimerSeconds(5);
      setTimerActive(true);
    }
  }, [questionStage, currentStepIndex, nextCard, nextStep, setTimerSeconds, setTimerActive, setQuestionStage, switchTurn]);

  const handleEasyCorrect = useCallback(() => {
    // Correct in easy mode means they get 0 points, then we move on.
    if (currentStepIndex === 2) {
      if (activeCard?.listQuestion && activeCard.listQuestion.enabled) {
        nextStep();
      } else {
        nextCard();
      }
    } else {
      nextStep();
    }
  }, [currentStepIndex, activeCard, nextStep, nextCard]);

  const handleEasyIncorrect = useCallback(() => {
    // Incorrect in easy mode means the *other* team gets full points, then we move on.
    const otherTeam = easyModeTeam === 'teamA' ? 'teamB' : 'teamA';
    if (!activeQuestion) return;
    addScore(otherTeam, activeQuestion.points);
    if (currentStepIndex === 2) {
      if (activeCard?.listQuestion && activeCard.listQuestion.enabled) {
        nextStep();
      } else {
        nextCard();
      }
    } else {
      nextStep();
    }
  }, [easyModeTeam, addScore, activeQuestion, currentStepIndex, activeCard, nextStep, nextCard]);

  const getSecondaryButtonText = useCallback(() => {
    if (questionStage === 'REVEALED_ANSWER') return currentStepIndex === 2 ? 'Next Chain' : 'Next Question';
    if (questionStage === 'STEAL_WINDOW') return 'Steal Failed';
    return 'Missed / Steal';
  }, [questionStage, currentStepIndex]);

  const handleEasyTrigger = useCallback(() => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance("Who said that?");
      window.speechSynthesis.speak(msg);
    }
    setShowEasyModal(true);
  }, []);

  if (!activeCard || !activeQuestion) {
    return <div className="text-white p-8">Loading or Error loading card...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-arena-slate font-sans relative w-full">
      {/* Header / Scoreboard */}
      <ScoreboardHeader
        teams={teams}
        activeTeam={activeTeam}
        deckName={selectedDeck?.deckName}
        parentTheme={activeCard.parentTheme}
        onEndGame={endGame}
        chainsRemaining={chainsRemaining}
      />

      {/* Main Play Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-8">

        <Pipeline activeCard={activeCard} currentStepIndex={currentStepIndex} activeTeam={activeTeam} />

        {/* Easy Mode Modal */}
        {showEasyModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="easy-mode-title"
              className="bg-arena-navy p-8 rounded-2xl border-2 border-arena-magenta shadow-[0_0_30px_rgba(236,72,153,0.5)] max-w-md w-full text-center"
            >
              <h2 id="easy-mode-title" className="text-3xl font-display text-white uppercase mb-6">Who Said Easy?</h2>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => { setEasyModeTeam('teamA'); setShowEasyModal(false); }}
                  className="px-6 py-4 bg-arena-magenta/20 hover:bg-arena-magenta text-white border border-arena-magenta rounded font-display text-xl uppercase transition-colors focus-visible:ring-2 focus-visible:ring-arena-magenta focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate"
                >
                  <span className="sr-only">Select </span>{teams.teamA.name}<span className="sr-only"> for Easy Mode penalty</span>
                </button>
                <button
                  onClick={() => { setEasyModeTeam('teamB'); setShowEasyModal(false); }}
                  className="px-6 py-4 bg-arena-cobalt/20 hover:bg-arena-cobalt text-white border border-arena-cobalt rounded font-display text-xl uppercase transition-colors focus-visible:ring-2 focus-visible:ring-arena-cobalt focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate"
                >
                  <span className="sr-only">Select </span>{teams.teamB.name}<span className="sr-only"> for Easy Mode penalty</span>
                </button>
              </div>
              <button
                autoFocus
                onClick={() => setShowEasyModal(false)}
                aria-label="Cancel Easy Mode Selection (Escape)"
                className="mt-8 text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none rounded focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate flex items-center justify-center gap-2 mx-auto"
              >
                <span>Cancel</span>
                <kbd className="font-sans text-xs bg-slate-800 border border-slate-600 px-1.5 py-0.5 rounded text-slate-400 shadow-inner group-hover:text-slate-300">Esc</kbd>
              </button>
            </div>
          </div>
        )}

        {questionStage === 'LIST_ACTIVE' || questionStage === 'LIST_REVEALED' ? (
           <div className={`w-full max-w-4xl bg-arena-navy rounded-2xl p-8 border ${getCategoryStyles(activeCard.listQuestion.listCategory).border} ${getCategoryStyles(activeCard.listQuestion.listCategory).shadow} relative mb-8`}>
              <h3 className="text-2xl font-display text-arena-gold mb-4 uppercase flex items-center gap-2">
                 <span className="bg-arena-gold text-arena-slate px-2 py-1 rounded text-sm">Boss Battle</span>
                 <span className={`px-2 py-1 rounded text-sm ${getCategoryStyles(activeCard.listQuestion.listCategory).badgeBg}`}>
                    {activeCard.listQuestion.listCategory}
                 </span>
                 List Question
              </h3>
              <p className="text-3xl text-white font-medium mb-4 leading-relaxed">
                 {activeCard.listQuestion.promptText}
              </p>
              <p className="text-lg text-slate-300 mb-8 font-sans">
                Target: Name <span className="font-bold text-white">{activeCard.listQuestion.requiredToPass}</span> items to win.
              </p>

              <div
                tabIndex={0}
                className="bg-arena-slate p-6 rounded-xl border border-slate-700 mt-8 relative group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-gold"
              >
                 <div className={`absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-all duration-300 flex items-center justify-center z-10 cursor-pointer ${
                     questionStage === 'LIST_REVEALED'
                       ? 'opacity-0 pointer-events-none'
                       : 'group-hover:opacity-0 group-hover:backdrop-blur-none group-focus:opacity-0 group-focus:backdrop-blur-none'
                   }`}>
                    <span aria-hidden="true" className="text-slate-400 font-display uppercase tracking-widest flex items-center gap-2">
                       Hover or Focus to Reveal List
                    </span>
                 </div>
                 <div className="text-left space-y-2">
                    <span className="text-sm text-slate-500 uppercase tracking-wider block mb-4">Accepted Answers</span>
                    <ul className="list-disc list-inside text-2xl font-display text-emerald-400 grid grid-cols-2 gap-2">
                       {activeCard.listQuestion.correctItems.map((item, idx) => (
                          <li key={idx}>{item}</li>
                       ))}
                    </ul>
                 </div>
              </div>
           </div>
        ) : (
        <>
        {/* Question Card */}
        <div className={`w-full max-w-4xl bg-arena-navy rounded-2xl p-8 border ${getCategoryStyles(activeQuestion.category).border} ${getCategoryStyles(activeQuestion.category).shadow} relative mb-8`}>

          <div className="absolute top-0 right-0 p-4">
             <StealTimer />
          </div>

          <div aria-live="polite" aria-atomic="true">
            <h3 className="text-2xl font-display text-slate-400 mb-4 uppercase flex items-center gap-2">
              Question {currentStepIndex + 1}
              <span className={`px-2 py-1 rounded text-sm ${getCategoryStyles(activeQuestion.category).badgeBg}`}>
                {activeQuestion.category}
              </span>
            </h3>
            <p className="text-3xl text-white font-medium mb-8 leading-relaxed">
              {activeQuestion.questionText}
            </p>
          </div>

          <div
            tabIndex={0}
            className="bg-arena-slate p-6 rounded-xl border border-slate-700 mt-8 relative group overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-magenta"
          >
             <div className={`absolute inset-0 bg-slate-900/80 backdrop-blur-md transition-all duration-300 flex items-center justify-center z-10 cursor-pointer ${
                 questionStage === 'REVEALED_ANSWER'
                   ? 'opacity-0 pointer-events-none'
                   : 'group-hover:opacity-0 group-hover:backdrop-blur-none group-focus:opacity-0 group-focus:backdrop-blur-none'
               }`}>
                <span aria-hidden="true" className="text-slate-400 font-display uppercase tracking-widest flex items-center gap-2">
                   {questionStage === 'STEAL_WINDOW' ? 'Wait for steal timer or Hover/Focus to Override' : 'Hover or Focus to Reveal Answer'}
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
        </>
        )}

        {/* Host Controls */}
        <div className="flex flex-col items-center gap-4 mt-4 mb-20">
          {!easyModeTeam ? (
            <div className="flex gap-6">
               {(questionStage === 'LIST_ACTIVE' || questionStage === 'LIST_REVEALED') ? (
                 <>
                   <button onClick={() => { addScore(activeTeam, activeCard.listQuestion.points); nextCard(); }} className="px-10 py-4 rounded-lg font-display text-xl uppercase tracking-wider transition-all shadow-lg bg-arena-gold hover:bg-yellow-500 text-arena-slate focus-visible:ring-2 focus-visible:ring-arena-gold focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate">
                     List Completed (+{activeCard.listQuestion.points})
                   </button>
                   <button onClick={nextCard} className="px-10 py-4 rounded-lg font-display text-xl uppercase tracking-wider transition-all shadow-lg bg-slate-600 hover:bg-slate-500 text-white focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate">
                     List Failed / Next Chain
                   </button>
                 </>
               ) : (
                 <>
                 <div className="relative group flex">
                <button
                onClick={questionStage === 'REVEALED_ANSWER' ? undefined : handleCorrect}
                aria-disabled={questionStage === 'REVEALED_ANSWER'}
                aria-describedby={questionStage === 'REVEALED_ANSWER' ? "correct-disabled-tooltip" : undefined}
                className={`px-10 py-4 rounded-lg font-display text-xl uppercase tracking-wider transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate ${questionStage === 'REVEALED_ANSWER' ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
              >
                Correct (+{activeQuestion.points})
              </button>
              {questionStage === 'REVEALED_ANSWER' && (
                <div id="correct-disabled-tooltip" role="tooltip" aria-hidden="true" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 bg-slate-800 text-white text-sm rounded border border-slate-600 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 whitespace-nowrap pointer-events-none z-10">
                  Answer revealed. Proceed to next.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                </div>
              )}
              </div>
              <button
              onClick={handleMissedOrNext}
              className={`px-10 py-4 text-white rounded-lg font-display text-xl uppercase tracking-wider transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate ${questionStage === 'REVEALED_ANSWER' ? 'bg-arena-cobalt hover:bg-blue-500' : 'bg-slate-600 hover:bg-slate-500'}`}
            >
                {getSecondaryButtonText()}
              </button>
                </>
               )}
            </div>
          ) : (
            <div className="flex gap-6">
              <button
                onClick={handleEasyCorrect}
                className="px-10 py-4 rounded-lg font-display text-xl uppercase tracking-wider transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {teams[easyModeTeam].name} Correct (0 pts)
              </button>
              <button
                onClick={handleEasyIncorrect}
                className="px-10 py-4 rounded-lg font-display text-xl uppercase tracking-wider transition-all shadow-lg focus-visible:ring-2 focus-visible:ring-arena-crimson focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate bg-arena-crimson hover:bg-red-500 text-white"
              >
                {teams[easyModeTeam].name} Incorrect (+{activeQuestion.points} to {teams[easyModeTeam === 'teamA' ? 'teamB' : 'teamA'].name})
              </button>
          </div>
          )}

          {(questionStage === 'HIDDEN' || questionStage === 'STEAL_WINDOW') && !easyModeTeam && (
            <button
              onClick={handleEasyTrigger}
              className="mt-4 px-8 py-3 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500 text-amber-500 rounded-lg font-display uppercase tracking-wider transition-all focus-visible:ring-2 focus-visible:ring-amber-500 focus:outline-none"
            >
              <span className="sr-only">Trigger Easy Mode Penalty: </span>Someone Said "Easy", Press This
            </button>
          )}
        </div>
      </div>

      {/* Footer - Red Cards */}
      <RedCardFooter />

    </div>
  );
};
