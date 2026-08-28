import React, { useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { RED_CARD_CATEGORY_INDEX } from '../utils/redCardData';
import { RedCard } from '../types/game';

// ⚡ Bolt Optimization: Extract static list items into a memoized component to prevent unnecessary re-renders when the modal mounts or updates.
const RedCardItem = React.memo(({ card }: { card: RedCard }) => (
  <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
    <h5 className="text-xl font-display text-white mb-2 uppercase">{card.title}</h5>
    <p className="text-slate-300 mb-3">{card.description}</p>
    {card.examples && card.examples.length > 0 && (
      <div className="space-y-1">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Examples:</span>
        <ul className="list-disc list-inside space-y-1">
          {card.examples.map((example, idx) => (
            <li key={idx} className="text-sm text-slate-200 italic">
              {example}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
));
RedCardItem.displayName = 'RedCardItem';

export const RedCardModal: React.FC = () => {
  // ⚡ Bolt Optimization: Use useShallow to prevent the modal from re-rendering
  // when unrelated game state changes occur.
  const { activeRedCard, setActiveRedCard } = useGameStore(
    useShallow((state) => ({
      activeRedCard: state.activeRedCard,
      setActiveRedCard: state.setActiveRedCard,
    }))
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeRedCard) {
        setActiveRedCard(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRedCard, setActiveRedCard]);

  if (!activeRedCard) return null;

  // ⚡ Bolt Optimization: Replaced O(N) Array.find calls within a switch statement
  // with a direct O(1) object lookup, reducing unnecessary overhead during modal render.
  const category = activeRedCard ? RED_CARD_CATEGORY_INDEX[activeRedCard] : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-red-900/95 backdrop-blur-md p-4 w-full h-full">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="red-card-title"
        className="bg-arena-slate border-4 border-arena-crimson rounded-3xl p-8 max-w-4xl w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.5)] relative overflow-hidden flex flex-col max-h-[90vh]"
      >

        {/* Background visual element */}
        <div className="absolute -right-20 -top-20 opacity-10 pointer-events-none">
          <svg aria-hidden="true" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
            <path d="M8.5 8.5v.01"/>
            <path d="M16 15.5v.01"/>
            <path d="M12 12v.01"/>
            <path d="M11 17a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
            <path d="M11 7a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
          </svg>
        </div>

        <div className="flex-shrink-0">
          <h2 id="red-card-title" className="text-4xl font-display text-arena-crimson mb-2 uppercase tracking-widest relative z-10">
            Frozen Board
          </h2>
          <h3 className="text-2xl font-display text-white mb-6 uppercase relative z-10">
            Referee Intercession
          </h3>
        </div>

        <div tabIndex={0} className="bg-slate-800 p-6 rounded-xl border border-slate-600 mb-8 relative z-10 flex-grow overflow-y-auto custom-scrollbar text-left focus-visible:ring-2 focus-visible:ring-arena-amber focus:outline-none">
          {category ? (
            <>
              <h4 className="text-3xl font-display text-arena-amber mb-6 text-center border-b border-slate-700 pb-4">{category.title}</h4>
              <div className="space-y-6">
                {category.cards.map((card) => (
                  <RedCardItem key={card.type} card={card} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center">
              <h4 className="text-3xl font-display text-arena-amber mb-4">Official Warning</h4>
              <p className="text-xl text-slate-300 leading-relaxed">Please refer to the official tournament rules.</p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <button type="button"
            autoFocus
            onClick={() => setActiveRedCard(null)}
            className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-display text-2xl uppercase tracking-wider transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.4)] relative z-10 focus-visible:ring-2 focus-visible:ring-emerald-400 focus:outline-none focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate flex items-center justify-center gap-3 mx-auto"
          >
            <span>Release Board & Resume Play</span>
            <kbd className="font-sans text-sm bg-emerald-700/50 border border-emerald-400/30 px-2 py-1 rounded-md text-emerald-100/80 shadow-inner">
              <span aria-hidden="true">Esc</span>
              <span className="sr-only">(Escape)</span>
            </kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
