import React, { useState, useEffect, memo, useRef, useMemo } from 'react';
import { BookOpen, X, Search } from 'lucide-react';

import { RED_CARD_CATEGORIES } from "../utils/redCardData";
import { RedCardCategory } from "../types/game";
const LEFT_SIDEBAR_CATEGORIES = [
  RED_CARD_CATEGORIES[0], // Category Violations
  RED_CARD_CATEGORIES[1], // Medium Violations
  RED_CARD_CATEGORIES[2], // Canon Violations
];

interface RedCardListProps {
  categories: RedCardCategory[];
  searchTerm: string;
}

const RedCardList = memo(({ categories, searchTerm }: RedCardListProps) => {
  const normalizedSearch = searchTerm.toLowerCase().trim();

  // ⚡ Bolt Optimization: Wrap the mapping logic in a useMemo hook to avoid recalculating
  // and re-allocating new objects when the search bar is empty or the input hasn't changed.
  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) return categories.filter(category => category.cards.length > 0);

    return categories.map(category => {
      // ⚡ Bolt Optimization: Use pre-computed normalized properties instead of calling
      // .toLowerCase() on every card's title, description, and examples on every keystroke.
      // This avoids O(N) redundant string allocations and reduces GC pressure during rapid typing.
      const filteredCards = category.cards.filter(card => {
        const matchTitle = card._normalizedTitle?.includes(normalizedSearch) ?? false;
        const matchDesc = card._normalizedDescription?.includes(normalizedSearch) ?? false;
        // ⚡ Bolt Optimization: Use the pre-computed concatenated string to avoid an inner O(N)
        // array iteration (`.some()`) and closure allocation on every card during rapid typing.
        const matchExample = card._normalizedExamplesStr?.includes(normalizedSearch) ?? false;
        return matchTitle || matchDesc || matchExample;
      });

      return {
        ...category,
        cards: filteredCards
      };
    }).filter(category => category.cards.length > 0);
  }, [categories, normalizedSearch]);

  if (filteredCategories.length === 0) {
    return (
      <div role="status" className="flex-1 p-8 text-center text-slate-400 flex flex-col items-center justify-center">
        <Search className="w-12 h-12 mb-4 opacity-50" />
        <p className="text-lg">No matching red cards found for "<span className="text-white font-medium">{searchTerm}</span>".</p>
        <p className="text-sm mt-2 opacity-75">Try adjusting your search terms.</p>
      </div>
    );
  }

  return (
    <div tabIndex={0} className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar focus-visible:ring-2 focus-visible:ring-arena-crimson focus:outline-none focus-visible:ring-inset">
      {filteredCategories.map((category) => (
        <div key={category.title} className="space-y-4">
          <h3 className="text-xl font-display text-white border-b border-slate-700 pb-2">{category.title}</h3>
          <div className="space-y-6">
            {category.cards.map((card) => {
              const isRefereeTool = category.title === 'Referee Tools';
              const borderColor = isRefereeTool ? 'border-amber-500' : 'border-slate-700';
              const headerColor = isRefereeTool ? 'text-amber-500' : 'text-arena-amber';
              const bgColor = isRefereeTool ? 'bg-amber-950/30' : 'bg-slate-800/50';

              return (
                <div key={card.type} className={`p-4 rounded-lg border ${borderColor} ${bgColor}`}>
                  <h4 className={`text-lg font-display ${headerColor} mb-2 uppercase`}>{card.title}</h4>
                  <p className="text-sm text-slate-300 mb-3">{card.description}</p>
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Examples:</span>
                    <ul className="list-disc list-inside space-y-1">
                      {card.examples.map((example, idx) => (
                        <li key={idx} className="text-sm text-slate-200 italic">
                          {example}
                        </li>
                      ))}
                    </ul>
                    {card.suggestedPenalties && card.suggestedPenalties.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-600/50">
                        <span className="text-xs font-bold text-arena-crimson uppercase tracking-wider block mb-1">Suggested Penalties:</span>
                        <ul className="list-disc list-inside space-y-1">
                          {card.suggestedPenalties.map((penalty, idx) => (
                            <li key={`penalty-${idx}`} className="text-sm text-arena-amber">
                              {penalty}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});
RedCardList.displayName = 'RedCardList';


const RIGHT_SIDEBAR_CATEGORIES = [
  RED_CARD_CATEGORIES[3], // Gameplay & Mechanics
  RED_CARD_CATEGORIES[4], // Referee Tools
];

export const RedCardGuide: React.FC = () => {
  const [activeSidebar, setActiveSidebar] = useState<'left' | 'right' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Ref to track current search term for the escape handler without needing to add it to deps
  const searchTermRef = useRef(searchTerm);
  useEffect(() => {
    searchTermRef.current = searchTerm;
  }, [searchTerm]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeSidebar) {
        if (searchTermRef.current) {
          setSearchTerm('');
          searchInputRef.current?.focus();
        } else {
          setActiveSidebar(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSidebar]);

  const handleCloseSidebar = () => {
    setActiveSidebar(null);
    setSearchTerm('');
  };

  return (
    <>
      {!activeSidebar && (
        <>
          {/* Left Access Button */}
          <button
            onClick={() => setActiveSidebar('left')}
            className={`fixed top-1/2 -translate-y-1/2 left-0 rounded-r-xl bg-arena-crimson hover:bg-red-600 text-white p-3 shadow-lg z-40 transition-all group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate focus-visible:ring-arena-crimson focus:outline-none flex items-center justify-center`}
            aria-label="Open Left Red Card Guide (Category, Medium, Canon)"
          >
            <BookOpen aria-hidden="true" className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span
              aria-hidden="true"
              className={`absolute left-full ml-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible peer-focus-visible:opacity-100 peer-focus-visible:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide`}
            >
              Category, Medium & Canon
            </span>
          </button>

          {/* Right Access Button */}
          <button
            onClick={() => setActiveSidebar('right')}
            className={`peer fixed top-1/2 -translate-y-1/2 right-0 rounded-l-xl bg-arena-crimson hover:bg-red-600 text-white p-3 shadow-lg z-40 transition-all group focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate focus-visible:ring-arena-crimson focus:outline-none flex items-center justify-center`}
            aria-label="Open Right Red Card Guide (Gameplay, Referee)"
          >
            <BookOpen aria-hidden="true" className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span
              aria-hidden="true"
              className={`absolute right-full mr-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible peer-focus-visible:opacity-100 peer-focus-visible:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide`}
            >
              Gameplay & Referee Tools
            </span>
          </button>
        </>
      )}

      {activeSidebar && (
        <div
          role="dialog"
          aria-label={`${activeSidebar === 'left' ? 'Left' : 'Right'} Red Card Guide`}
          className={`fixed top-0 bottom-0 ${
            activeSidebar === 'right' ? 'right-0 border-l-4' : 'left-0 border-r-4'
          } w-80 bg-arena-navy/95 backdrop-blur-md border-arena-crimson shadow-[-10px_0_30px_rgba(0,0,0,0.5)] z-50 flex flex-col transition-all duration-300 overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
            <h2 className="text-xl font-display text-arena-crimson uppercase tracking-wider flex items-center gap-2">
              <BookOpen aria-hidden="true" className="w-5 h-5" />
              Red Cards
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCloseSidebar}
                className="group relative p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-crimson"
                aria-label="Close Red Card Guide (Escape)"
              >
                <X aria-hidden="true" className="w-5 h-5" />
                <span
                  aria-hidden="true"
                  className="absolute right-0 top-full mt-2 whitespace-nowrap bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-visible:opacity-100 group-focus-visible:visible transition-all duration-200 border border-slate-600 shadow-md font-sans tracking-wide z-50 flex items-center gap-1.5"
                >
                  <span>Close Guide</span>
                  <kbd className="font-sans text-[10px] bg-slate-700 border border-slate-500 px-1 py-0.5 rounded text-slate-300 shadow-inner">Esc</kbd>
                </span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 bg-slate-800/80 border-b border-slate-700">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                autoFocus
                className="block w-full pl-10 pr-10 py-2 border border-slate-600 rounded-md leading-5 bg-slate-900 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-arena-crimson focus:border-arena-crimson sm:text-sm transition-colors"
                placeholder="Search violations or quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search red cards by title, description, or example quotes"
              />
              {searchTerm.length > 0 && (
                <button
                  onClick={() => { setSearchTerm(''); searchInputRef.current?.focus(); }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center p-1.5 text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-arena-crimson rounded-r-md group"
                  aria-label="Clear search input (Escape)"
                >
                  <X aria-hidden="true" className="w-4 h-4" />
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
          </div>

          {/* Content */}
          <RedCardList
            categories={activeSidebar === 'left' ? LEFT_SIDEBAR_CATEGORIES : RIGHT_SIDEBAR_CATEGORIES}
            searchTerm={searchTerm}
          />
        </div>
      )}
    </>
  );
};
