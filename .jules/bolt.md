## 2026-06-26 - Zustand Full Store Re-renders
**Learning:** Destructuring the entire `useGameStore()` in top-level and heavy components (`App`, `ArenaBoard`, etc.) was causing massive, codebase-wide unnecessary re-renders. Every time a localized state changed (like the fast-ticking `timerSeconds`), components that didn't need that data were forced to re-render.
**Action:** When extracting state from the Zustand store, always use specific selectors alongside `useShallow` from `zustand/react/shallow` to strictly bound subscriptions and avoid unnecessary React render cycles.

## 2024-06-27 - Initial Route Code Splitting
**Learning:** The single-page app previously loaded all components (Lobby, Arena, Summary, Modals) into the main bundle even though only LobbyHub is displayed initially. This increased initial load time and memory usage needlessly. However, when lazy-loading `RedCardModal`, the global Suspense boundary caused the entire `ArenaBoard` to disappear and show a loading screen while the modal chunk was fetched.
**Action:** Implemented React.lazy and Suspense in App.tsx to split route-level components into separate chunks. The main bundle `index.js` dropped from ~214KB to ~204KB. Kept `RedCardModal` eagerly loaded to avoid UX regressions when it is triggered, ensuring the active game board remains visible.

## 2024-06-28 - Fast-Changing State Extraction
**Learning:** Even with `useShallow`, if a component binds to a frequently updating state property (like a ticking `timerSeconds`), it will re-render on every update. In heavy parent components like `ArenaBoard`, this creates significant re-render overhead.
**Action:** When part of a UI requires fast-changing state, extract that specific UI into a small, isolated child component (`StealTimer`) and have *only* the child component subscribe to the fast-changing state via Zustand.

## 2024-06-29 - Uncontrolled Inputs for Top-Level Setup Screens
**Learning:** Top-level components like `LobbyHub` often contain state that doesn't need to be reactive (like team names before submitting). Using `useState` for text inputs in these components causes the entire component (and its map iterations over large data sets like `defaultDecks`) to re-render on every keystroke, introducing typing latency.
**Action:** Use uncontrolled components with `useRef` for text inputs when the value is only needed on a final submit action (like starting a match). This is especially critical in large components or setup screens that render multiple child elements based on static data.

## 2024-07-28 - [Pre-compute Normalized Strings for Database Filtering]
**Learning:** Calling `.toLowerCase()` repeatedly within array `.filter()` loops during database searches (e.g., `getQuestionsByDifficulty`, `getQuestionsByDeck`) introduces unnecessary overhead, especially as the CSV database grows.
**Action:** When parsing static datasets (like `parseDatabaseCSV`), pre-compute normalized string properties (like `normalizedDifficulty` and `normalizedDeckTheme`). Hoist the search target normalization outside the filter loop to achieve O(n) string comparisons without O(n) re-allocations and conversions.
## 2026-07-01 - [Memoize ArenaBoard Render Pipeline]
**Learning:** In React components with complex layouts like ArenaBoard, rendering large nested structures like the step pipeline on every timer tick can be expensive and cause unnecessary layout recalculation and DOM updates.
**Action:** Extract expensive rendering blocks into isolated components or wrap them in `useMemo()` if they only depend on specific state fields (like `activeCard`, `currentStepIndex`, `activeTeam`), keeping fast-changing unrelated state (like timers) from triggering heavy re-renders.
