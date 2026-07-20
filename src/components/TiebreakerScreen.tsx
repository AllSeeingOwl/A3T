import React, { useState, useMemo, useCallback, memo } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { ShieldAlert, Check, X, Undo2, Plus } from 'lucide-react';

type ItemStatus = 'unmarked' | 'tick' | 'cross';
interface ChecklistItem {
  id: string;
  text: string;
  status: ItemStatus;
}

// ⚡ Bolt Optimization: Extract checklist item rendering into a memoized component.
// Combined with useCallback on the update handler, this ensures that checking/unchecking
// one item only re-renders that specific item, instead of the entire checklist.
const ChecklistItemView = memo(({
  item,
  onUpdate
}: {
  item: ChecklistItem;
  onUpdate: (id: string, status: ItemStatus) => void
}) => (
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
      'text-white'
    }`}>
      {item.text}
    </span>
    <div className="flex gap-1 ml-3">
      <button
        onClick={() => onUpdate(item.id, 'tick')}
        className={`p-1.5 rounded hover:bg-emerald-500/20 text-emerald-500 ${item.status === 'tick' ? 'bg-emerald-500/20 ring-1 ring-emerald-500/50' : ''}`}
        title="Mark Correct"
        aria-label={`Mark ${item.text} correct`}
      >
        <Check className="w-5 h-5" />
      </button>
      <button
        onClick={() => onUpdate(item.id, 'cross')}
        className={`p-1.5 rounded hover:bg-red-500/20 text-red-500 ${item.status === 'cross' ? 'bg-red-500/20 ring-1 ring-red-500/50' : ''}`}
        title="Mark Incorrect"
        aria-label={`Mark ${item.text} incorrect`}
      >
        <X className="w-5 h-5" />
      </button>
      {item.status !== 'unmarked' && (
        <button
          onClick={() => onUpdate(item.id, 'unmarked')}
          className="p-1.5 rounded hover:bg-slate-600 text-slate-400"
          title="Reset"
          aria-label={`Reset ${item.text}`}
        >
          <Undo2 className="w-5 h-5" />
        </button>
      )}
    </div>
  </div>
));
ChecklistItemView.displayName = 'ChecklistItemView';

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
        status: 'unmarked' as ItemStatus
      }));
    }
    return [];
  });

  // ⚡ Bolt Optimization: Use an uncontrolled input with useRef instead of controlled state.
  // This prevents the entire TiebreakerScreen (and the large checklist array) from
  // re-rendering on every single keystroke in the custom input textarea.
  const customInputRef = React.useRef<HTMLTextAreaElement>(null);

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
          status: 'unmarked' as ItemStatus
        }))
      );
    } else {
      setChecklist([]);
    }
  }

  // ⚡ Bolt Optimization: Memoize the update handler to preserve reference equality
  // so that ChecklistItemView doesn't receive a new function reference every render.
  const updateItemStatus = useCallback((id: string, status: ItemStatus) => {
    setChecklist(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  }, []);

  const addCustomItems = () => {
    const inputValue = customInputRef.current?.value;
    if (!inputValue || !inputValue.trim()) return;

    const newItems = inputValue
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((text, idx) => ({
        id: `custom-${Date.now()}-${idx}`,
        text,
        status: 'unmarked' as ItemStatus,
      }));

    setChecklist(prev => [...prev, ...newItems]);
    if (customInputRef.current) {
      customInputRef.current.value = '';
    }
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

          {/* Host Checklist Tool */}
          <div className="mt-8 bg-slate-900 p-6 rounded-lg border border-slate-700">
            <h4 className="text-xl font-display text-arena-gold mb-4 uppercase">Host Checklist Tool</h4>

            <div className="flex gap-2 mb-6">
              <textarea
                ref={customInputRef}
                placeholder="Paste or type custom answers here (one per line)..."
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

            {checklist.length > 0 ? (
              <div tabIndex={0} className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[40vh] overflow-y-auto pr-2 focus-visible:ring-2 focus-visible:ring-arena-gold focus:outline-none rounded">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3 rounded border transition-colors ${
                      item.status === 'tick' ? 'bg-emerald-900/40 border-emerald-500/50' :
                      item.status === 'cross' ? 'bg-red-900/40 border-red-500/50' :
                      'bg-slate-800 border-slate-600'
                    }`}
                  >
                    <span className={`text-lg flex-1 ${
                      item.status === 'tick' ? 'text-emerald-400 line-through' :
                      item.status === 'cross' ? 'text-red-400 line-through' :
                      'text-white'
                    }`}>
                      {item.text}
                    </span>
                    <div className="flex gap-1 ml-3">
                      <button
                        onClick={() => updateItemStatus(item.id, 'tick')}
                        className={`group relative p-1.5 rounded hover:bg-emerald-500/20 text-emerald-500 focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none ${item.status === 'tick' ? 'bg-emerald-500/20 ring-1 ring-emerald-500/50' : ''}`}
                        aria-label={`Mark ${item.text} correct`}
                      >
                        <Check aria-hidden="true" className="w-5 h-5" />
                        <span aria-hidden="true" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50">Mark Correct</span>
                      </button>
                      <button
                        onClick={() => updateItemStatus(item.id, 'cross')}
                        className={`group relative p-1.5 rounded hover:bg-red-500/20 text-red-500 focus-visible:ring-2 focus-visible:ring-red-400 focus:outline-none ${item.status === 'cross' ? 'bg-red-500/20 ring-1 ring-red-500/50' : ''}`}
                        aria-label={`Mark ${item.text} incorrect`}
                      >
                        <X aria-hidden="true" className="w-5 h-5" />
                        <span aria-hidden="true" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50">Mark Incorrect</span>
                      </button>
                      {item.status !== 'unmarked' && (
                        <button
                          onClick={() => updateItemStatus(item.id, 'unmarked')}
                          className="group relative p-1.5 rounded hover:bg-slate-600 text-slate-400 focus-visible:ring-2 focus-visible:ring-slate-400 focus:outline-none"
                          aria-label={`Reset ${item.text}`}
                        >
                          <Undo2 aria-hidden="true" className="w-5 h-5" />
                          <span aria-hidden="true" className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50">Reset</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <ChecklistItemView key={item.id} item={item} onUpdate={updateItemStatus} />
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-center py-4">No checklist items yet. Add custom items above.</p>
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
          <div aria-live="polite" aria-atomic="true" className="relative z-10 animate-pulse text-3xl font-display text-arena-gold uppercase">
            Winner Declared! Returning to Podium...
          </div>
        )}

      </div>
    </div>
  );
};
