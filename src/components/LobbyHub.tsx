import React, { useState, useRef, useEffect, memo } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { useShallow } from 'zustand/react/shallow';
import { sanitizeHTML } from '../utils/sanitize';
import { CheckCircle2, Circle } from 'lucide-react';
import { Deck } from '../types/game';

interface TeamInputProps {
  id: string;
  label: string;
  defaultValue: string;
  colorClass: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

// ⚡ Bolt Optimization: Added memo() to TeamInput.
// This prevents the inputs (and their localized character count state) from unnecessarily
// re-rendering every time the user clicks a different deck (which updates selectedDeckId in LobbyHub).
const TeamInput = memo(({ id, label, defaultValue, colorClass, inputRef }: TeamInputProps) => {
  const [count, setCount] = useState(defaultValue.length);

  return (
    <div className={`flex-1 bg-arena-navy p-6 rounded-xl border-t-4 ${colorClass} shadow-lg flex flex-col relative`}>
      <div className="flex justify-between items-center mb-4">
        <label htmlFor={id} className={`text-2xl font-display ${id === 'team1' ? 'text-arena-magenta' : 'text-arena-cobalt'} uppercase block`}>
          {label}
        </label>
        <span id={`char-count-${id}`} className={`text-sm font-sans ${count >= 50 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
          {count}/50
        </span>
      </div>
      <input
        id={id}
        aria-describedby={`char-count-${id}`}
        type="text"
        className={`w-full bg-arena-slate text-white p-3 rounded border border-arena-navy ${id === 'team1' ? 'focus:border-arena-magenta' : 'focus:border-arena-cobalt'} focus:outline-none text-xl`}
        defaultValue={defaultValue}
        ref={inputRef}
        placeholder="Enter Team Name"
        maxLength={50}
        onFocus={(e) => e.target.select()}
        onChange={(e) => setCount(e.target.value.length)}
      />
    </div>
  );
});
TeamInput.displayName = 'TeamInput';

type ThemeStyle = { font: string; color: string; size: string };

const THEME_STYLES: ThemeStyle[] = [
  { font: 'font-videogame', color: 'text-emerald-400', size: 'text-3xl md:text-4xl leading-tight py-4' },
  { font: 'font-animation', color: 'text-arena-gold', size: 'text-5xl md:text-6xl tracking-wider py-4' },
  { font: 'font-wrestling', color: 'text-red-500', size: 'text-4xl md:text-5xl uppercase tracking-tighter py-4' },
];

// ⚡ Bolt Optimization: Extract deck selection label into a React.memo() component.
// This prevents unaffected deck cards from re-rendering whenever selectedDeckId changes.
const DeckSelectionCard = memo(({
  deck,
  isSelected,
  onSelect
}: {
  deck: Deck;
  isSelected: boolean;
  onSelect: (deckId: string) => void;
}) => (
  <label
    className={`p-4 rounded-lg border-2 text-left transition-all flex flex-col h-full cursor-pointer has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-arena-gold has-[:focus-visible]:outline-none ${
      isSelected
        ? 'border-arena-gold bg-arena-slate scale-105'
        : 'border-slate-600 bg-arena-slate hover:border-slate-400'
    }`}
  >
    <input
      type="radio"
      name="deck-selection"
      value={deck.deckId}
      checked={isSelected}
      onChange={() => onSelect(deck.deckId)}
      className="sr-only"
    />
    <div className="flex justify-between items-start w-full mb-2">
      <h3 className="text-xl font-display text-white">
        {deck.deckName}
      </h3>
      {isSelected ? (
        <CheckCircle2 className="w-6 h-6 text-arena-gold flex-shrink-0 ml-2" aria-hidden="true" />
      ) : (
        <Circle className="w-6 h-6 text-slate-500 flex-shrink-0 ml-2" aria-hidden="true" />
      )}
    </div>
    <p className="text-sm text-slate-300">{deck.deckDescription}</p>
    <p className="text-xs text-slate-400 mt-2">{deck.cards.length} Chains</p>
  </label>
));
DeckSelectionCard.displayName = 'DeckSelectionCard';

export const LobbyHub: React.FC = () => {
  // Select a random theme style on initial mount
  const [titleTheme] = useState<ThemeStyle>(() => {
    return THEME_STYLES[Math.floor(Math.random() * THEME_STYLES.length)];
  });

  // ⚡ Bolt Optimization: Use useShallow to prevent the Lobby from re-rendering
  // on unrelated game store changes.
  const { startMatch, defaultDecks } = useGameStore(
    useShallow((state) => ({
      startMatch: state.startMatch,
      defaultDecks: state.defaultDecks,
    }))
  );

  // ⚡ Bolt Optimization: Replace useState with useRef for team name inputs.
  // This prevents the entire LobbyHub component (and its map iterations)
  // from re-rendering on every single keystroke.
  const teamARef = useRef<HTMLInputElement>(null);
  const teamBRef = useRef<HTMLInputElement>(null);

  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  useEffect(() => {
    // ⚡ Bolt Optimization: Preload the heavy ArenaBoard component in the background
    // while the user configures the match. This eliminates the Suspense fallback
    // delay when clicking "Start Match", ensuring an instantaneous transition.
    import('./ArenaBoard').catch(() => {}); // Suppress unhandled rejections if fetch fails
  }, []);

  const handleStart = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const deck = defaultDecks.find((d) => d.deckId === selectedDeckId);
    if (deck) {
      const rawTeamA = teamARef.current?.value ?? 'Team A';
      const rawTeamB = teamBRef.current?.value ?? 'Team B';
      // 🛡️ Sentinel: Reject excessively large inputs to prevent ReDoS/Client-Side DoS during sanitization.
      // Do not truncate strings before sanitization, as this can split HTML tags and bypass the sanitizer.
      // Do not truncate strings after sanitization, as entity encoding alters string length.
      // Instead, reject inputs over 50 characters completely and fall back to safe defaults.
      const safeRawA = rawTeamA.length > 50 ? 'Team 1' : rawTeamA;
      const safeRawB = rawTeamB.length > 50 ? 'Team 2' : rawTeamB;
      const sanitizedTeamA = sanitizeHTML(safeRawA).trim() || 'Team 1';
      const sanitizedTeamB = sanitizeHTML(safeRawB).trim() || 'Team 2';
      startMatch(deck, sanitizedTeamA, sanitizedTeamB);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-arena-slate font-sans p-8 w-full">
      <h1 className={`${titleTheme.font} ${titleTheme.color} ${titleTheme.size} mb-12 text-center drop-shadow-lg transition-colors`}>
        Always A (Trivial) Triple Threat
      </h1>

      <form onSubmit={handleStart} className="w-full flex flex-col items-center">
        <div className="flex w-full max-w-4xl gap-8 mb-12">
          <TeamInput
            id="team1"
            label="Team 1"
            defaultValue="Team A"
            colorClass="border-arena-magenta"
            inputRef={teamARef}
          />
          <TeamInput
            id="team2"
            label="Team 2"
            defaultValue="Team B"
            colorClass="border-arena-cobalt"
            inputRef={teamBRef}
          />
        </div>

        <div className="w-full max-w-4xl bg-arena-navy p-8 rounded-xl shadow-lg border border-slate-700">
          <h2 id="deck-selection-title" className="text-3xl font-display text-white mb-6 uppercase text-center">Select Deck</h2>
          <fieldset aria-labelledby="deck-selection-title" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <legend className="sr-only">Choose a deck to play</legend>
            {defaultDecks.map((deck) => (
              <DeckSelectionCard
                key={deck.deckId}
                deck={deck}
                isSelected={selectedDeckId === deck.deckId}
                onSelect={setSelectedDeckId}
              />
            ))}
          </fieldset>
        </div>

        <div className="relative group mt-12 flex justify-center">
          <button
            type="submit"
            aria-disabled={!selectedDeckId}
            aria-describedby={!selectedDeckId ? "start-match-tooltip" : undefined}
            className={`peer px-12 py-4 rounded-full text-2xl font-display uppercase tracking-widest transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-arena-slate focus-visible:ring-emerald-500 focus:outline-none ${
              selectedDeckId
                ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-105 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            Start Match
          </button>
          {!selectedDeckId && (
            <div
              id="start-match-tooltip"
              role="tooltip"
              aria-hidden="true"
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-3 py-2 bg-slate-800 text-white text-sm rounded border border-slate-600 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible peer-focus-visible:opacity-100 peer-focus-visible:visible transition-all duration-200 whitespace-nowrap pointer-events-none"
            >
              Select a deck to start the match
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
