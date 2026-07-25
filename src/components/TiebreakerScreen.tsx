import React, { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { ShieldAlert, Check, X, Undo2, Plus } from 'lucide-react';

type ItemStatus = 'unmarked' | 'tick' | 'cross';
interface ChecklistItem {
  id: string;
  text: string;
  normalizedText: string;
  status: ItemStatus;
}



// ⚡ Bolt Optimization: Extract checklist items into a React.memo() component.
// This prevents every item in the list from re-rendering when only one item's status
// changes (which updates the parent's `checklist` array state).
const ChecklistItemRow = memo(({ item, onUpdateStatus, isBlurred = false }: { item: ChecklistItem; onUpdateStatus: (id: string, status: ItemStatus) => void; isBlurred?: boolean }) => (
  <div
    className={`flex items-center justify-between p-3 rounded border transition-colors ${
      item.status === 'tick' ? 'bg-emerald-900/40 border-emerald-500/50' :
      item.status === 'cross' ? 'bg-red-900/40 border-red-500/50' :
      'bg-slate-800 border-slate-600'
    }`}
  >
    <span className={`text-lg flex-1 ${
      item.status === 'tick' ? 'text-emerald-400 line-through' :
      item.status === 'cross' ? 'text-red-400 line-through' :
      isBlurred && item.status === 'unmarked' ? 'text-transparent bg-black rounded' :
      'text-white'
    }`}>
      {item.text}
    </span>
    <div className="flex gap-1 ml-3">
      <button
        onClick={() => onUpdateStatus(item.id, 'tick')}
        className={`group relative p-1.5 rounded hover:bg-emerald-500/20 text-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none ${item.status === 'tick' ? 'bg-emerald-500/20 ring-1 ring-emerald-500/50' : ''}`}
        aria-label={`Mark ${item.text} correct`}
      >
        <Check aria-hidden="true" className="w-5 h-5" />
        <span aria-hidden="true" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50">Mark Correct</span>
      </button>
      <button
        onClick={() => onUpdateStatus(item.id, 'cross')}
        className={`group relative p-1.5 rounded hover:bg-red-500/20 text-red-500 focus-visible:ring-2 focus-visible:ring-red-400 focus:outline-none ${item.status === 'cross' ? 'bg-red-500/20 ring-1 ring-red-500/50' : ''}`}
        aria-label={`Mark ${item.text} incorrect`}
      >
        <X aria-hidden="true" className="w-5 h-5" />
        <span aria-hidden="true" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50">Mark Incorrect</span>
      </button>
      {item.status !== 'unmarked' && (
        <button
          onClick={() => onUpdateStatus(item.id, 'unmarked')}
          className="group relative p-1.5 rounded hover:bg-slate-600 text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none"
          aria-label={`Reset ${item.text}`}
        >
          <Undo2 aria-hidden="true" className="w-5 h-5" />
          <span aria-hidden="true" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50">Reset</span>
        </button>
      )}
    </div>
  </div>
));
ChecklistItemRow.displayName = 'ChecklistItemRow';

export type RevealMode = 'idle' | 'revealing' | 'transition' | 'guessing';

// ⚡ Bolt Optimization: Isolate Autocomplete logic to prevent the parent from
// re-rendering on every keystroke.
const AutocompleteInput = memo(({ checklist, onMarkCorrect }: { checklist: ChecklistItem[], onMarkCorrect: (id: string) => void }) => {
  const [input, setInput] = useState('');

  // ⚡ Bolt Optimization: Hoist the static input lowercase string outside the filter loop
  // to avoid recalculating it O(N) times on every rapid keystroke.
  const lowerInput = input.toLowerCase();
  const suggestions = input.length > 0
    // ⚡ Bolt Optimization: Use pre-computed normalized string to avoid O(N) allocations
    ? checklist.filter(i => i.status === 'unmarked' && i.normalizedText.includes(lowerInput))
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    // ⚡ Bolt Optimization: Hoist the static lowercase search string outside the loop
    // to avoid recalculating it O(N) times on every rapid keystroke.
    const valLower = val.toLowerCase();
    // ⚡ Bolt Optimization: Use pre-computed normalized string to avoid O(N) allocations
    const exactMatch = checklist.find(i => i.status === 'unmarked' && i.normalizedText === valLower);
    if (exactMatch) {
      onMarkCorrect(exactMatch.id);
      setInput('');
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length === 1) {
      onMarkCorrect(suggestions[0].id);
      setInput('');
    } else if (e.key === 'Escape') {
      setInput('');
      e.preventDefault();
    }
  };

  return (
    <div className="mb-6 relative">
      <label htmlFor="guess-input" className="block text-sm text-slate-400 mb-2 uppercase tracking-wider">Type team guess (Autocomplete)</label>
      <div className="relative">
        <input
          id="guess-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Start typing an answer..."
          className="w-full bg-slate-800 text-white rounded-lg p-4 pr-12 border-2 border-emerald-500/50 focus:outline-none focus:border-emerald-500 text-xl font-medium placeholder-slate-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
          autoComplete="off"
        />
        {input.length > 0 && (
          <button
            onClick={() => { setInput(''); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 group"
            aria-label="Clear search input (Escape)"
          >
            <X aria-hidden="true" className="w-5 h-5" />
            <span
              aria-hidden="true"
              className="absolute right-0 top-full mt-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50 flex items-center gap-1.5"
            >
              <span>Clear</span>
              <kbd className="font-sans text-[10px] bg-slate-700 border border-slate-500 px-1 py-0.5 rounded text-slate-300 shadow-inner">Esc</kbd>
            </span>
          </button>
        )}
      </div>
      {input.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
          {suggestions.map(suggestion => (
            <button
              key={suggestion.id}
              onClick={() => { onMarkCorrect(suggestion.id); setInput(''); }}
              className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 border-b border-slate-700/50 last:border-0 focus:outline-none focus:bg-slate-700 transition-colors flex justify-between items-center group"
            >
              <span>{suggestion.text}</span>
              {suggestions.length === 1 && (
                <span className="text-xs text-slate-400 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity flex items-center gap-2">
                  <span>Select</span>
                  <kbd className="font-sans bg-slate-800 border border-slate-600 px-1.5 py-0.5 rounded text-slate-300 shadow-inner">Enter</kbd>
                </span>
              )}
            </button>
          ))}
          {suggestions.length === 0 && (
            <div className="px-4 py-3 text-slate-500 italic">No matching answers found.</div>
          )}
        </div>
      )}
    </div>
  );
});
AutocompleteInput.displayName = 'AutocompleteInput';

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
    if (window.confirm(`Are you sure you want to declare ${teams[team].name} the ultimate champion?`)) {
      // Add +1 to the winner to break the tie, then go back to summary
      addScore(team, 1);
      setWinnerDeclared(true);
      setTimeout(() => {
        endGame();
      }, 1500);
    }
  };

  // Find a list question to show, or just give a generic prompt.
  // In a real scenario, we might want a specific tiebreaker list.


// ⚡ Bolt Optimization: Memoize the Array.find operation to prevent O(N) array
  // searches from re-executing when unrelated local state (like winnerDeclared) changes.
  const randomListQuestion = useMemo(() => {
    return selectedDeck?.cards.find(c => c.listQuestion && c.listQuestion.enabled)?.listQuestion;
  }, [selectedDeck]);

  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => {
    if (randomListQuestion) {
      return randomListQuestion.correctItems.map((item, idx) => ({
        id: `pre-${idx}`,
        text: item,
        normalizedText: item.toLowerCase(),
        status: 'unmarked' as ItemStatus
      }));
    }
    return [];
  });
  const customInputRef = useRef<HTMLTextAreaElement>(null);

  const [revealMode, setRevealMode] = useState<RevealMode>('idle');
  const [revealTimer, setRevealTimer] = useState(0);

  // Re-initialize checklist if randomListQuestion changes,
  // but we can do this via an effect if needed. The linter complains about setState in useEffect.
  // Actually, this hook is only for TiebreakerScreen which doesn't change cards midway.
  // But if we want to be fully compliant and reactive:
  const prevQuestionRef = React.useRef(randomListQuestion);
  if (randomListQuestion !== prevQuestionRef.current) {
    prevQuestionRef.current = randomListQuestion;
    if (randomListQuestion) {
      setChecklist(
        randomListQuestion.correctItems.map((item, idx) => ({
          id: `pre-${idx}`,
          text: item,
          normalizedText: item.toLowerCase(),
          status: 'unmarked' as ItemStatus
        }))
      );
    } else {
      setChecklist([]);
    }
  }

  const updateItemStatus = useCallback((id: string, status: ItemStatus) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  }, []);


  // Remove eslint-disable comments from earlier
  const startRevealMode = () => {
    const itemCount = checklist.length;
    let initialTimer = 30; // Default: 10-19 items

    if (itemCount >= 25) {
      initialTimer = 90;
    } else if (itemCount >= 20) {
      initialTimer = 60;
    }

    setRevealTimer(initialTimer);
    setRevealMode('revealing');
  };

  // Timer Effect
  useEffect(() => {
    if (revealMode === 'idle' || revealMode === 'guessing') return;

    const interval = setInterval(() => {
      setRevealTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);

          if (revealMode === 'revealing') {
            setRevealMode('transition');
            return 5; // 5-second transition screen
          } else if (revealMode === 'transition') {
            setRevealMode('guessing');
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [revealMode]);

  const addCustomItems = () => {
    if (!customInputRef.current) return;
    const val = customInputRef.current.value;
    if (!val.trim()) return;
    const newItems = val
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((text, idx) => ({
        id: `custom-${Date.now()}-${idx}`,
        text,
        normalizedText: text.toLowerCase(),
        status: 'unmarked' as ItemStatus,
      }));

    setChecklist(prev => [...prev, ...newItems]);
    customInputRef.current.value = '';
  };

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
          </div>

          {/* Reveal Mode Conditonal UI */}
          {revealMode === 'idle' && checklist.length >= 10 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={startRevealMode}
                className="px-8 py-4 bg-arena-magenta hover:bg-pink-600 text-white rounded-xl font-display text-2xl uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(236,72,153,0.5)] focus-visible:ring-4 focus-visible:ring-pink-400 focus:outline-none"
              >
                Start Timed Reveal Mode
              </button>
            </div>
          )}

          {/* Revealing Phase */}
          {revealMode === 'revealing' && (
            <div className="mt-8 border-4 border-arena-magenta rounded-xl overflow-hidden relative shadow-[0_0_30px_rgba(236,72,153,0.4)]">
              <div className="bg-slate-900/80 p-4 border-b border-arena-magenta flex justify-between items-center backdrop-blur-sm">
                <span className="text-2xl font-display text-arena-magenta uppercase">Memorize the Answers!</span>
                <div className="text-right">
                   <span className="block text-xs uppercase tracking-widest text-arena-magenta font-bold">Time Remaining</span>
                   <span className="text-5xl font-display text-white">{revealTimer}s</span>
                </div>
              </div>
              <div className="p-6 bg-slate-800 grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
                {checklist.map((item) => (
                  <div key={item.id} className="bg-slate-900 p-4 rounded border border-slate-600 text-center flex items-center justify-center min-h-[80px]">
                    <span className="text-xl text-white font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transition Phase */}
          {revealMode === 'transition' && (
            <div className="mt-8 bg-black rounded-xl p-12 border border-slate-800 flex flex-col items-center justify-center min-h-[40vh] relative z-50">
              <ShieldAlert className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
              <h3 className="text-4xl font-display text-white uppercase tracking-widest mb-4">Look Away!</h3>
              <p className="text-xl text-slate-400 text-center max-w-lg mb-8">
                Teams must turn away from the screen before the guessing phase begins.
              </p>
              <div className="text-7xl font-display text-red-500">{revealTimer}</div>
            </div>
          )}

          {/* Host Checklist Tool */}
          {(revealMode === 'idle' || revealMode === 'guessing') && (
            <div className="mt-8 bg-slate-900 p-6 rounded-lg border border-slate-700">
            <h4 className="text-xl font-display text-arena-gold mb-4 uppercase">Host Checklist Tool</h4>

            {revealMode === 'guessing' ? (
              <AutocompleteInput checklist={checklist} onMarkCorrect={(id) => updateItemStatus(id, 'tick')} />
            ) : (
              <div className="flex gap-2 mb-6">
                <textarea
                  ref={customInputRef}
                  placeholder="Paste or type custom answers here (one per line)..."
                  aria-label="Custom answers"
                  className="flex-1 bg-slate-800 text-white rounded p-3 border border-slate-600 focus:outline-none focus:border-arena-gold resize-y min-h-[60px]"
                  rows={2}
                />
                <button
                  onClick={addCustomItems}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-display uppercase tracking-wider transition-colors flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-1" /> Add
                </button>
              </div>
            )}

            {checklist.length > 0 ? (
              <div tabIndex={0} className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 focus-visible:ring-2 focus-visible:ring-arena-gold focus:outline-none rounded">
                {checklist.map(item => (
                  <ChecklistItemRow key={item.id} item={item} onUpdateStatus={updateItemStatus} isBlurred={revealMode === 'guessing'} />
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-4">No checklist items yet. Add custom items above.</p>
            )}
          </div>
          )}
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
          <div aria-live="polite" aria-atomic="true" className="relative z-10 animate-pulse text-3xl font-display text-arena-gold uppercase">
            Winner Declared! Returning to Podium...
          </div>
        )}

      </div>
    </div>
  );
};
