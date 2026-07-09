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

## 2024-07-02 - React.memo() For Large Static Lists in Dynamic Panels
**Learning:** In panels like `RedCardGuide` where position (e.g., left/right screen toggling) is managed by parent state, large static DOM structures (like long lists of rules with over 100 DOM nodes) will re-render unnecessarily on every toggle if kept inline.
**Action:** Always extract heavy, static JSX into a standalone component wrapped in `React.memo()` when the parent component has unrelated state that triggers frequent re-renders.

## 2024-07-29 - [Optimize String Escaping with Single-Pass RegExp]
**Learning:** Chained `.replace()` calls for string sanitization (like `sanitizeHTML`) create unnecessary intermediate string allocations. When applied heavily, such as parsing thousands of rows from a CSV database, this becomes a performance bottleneck. Using a single-pass RegExp (`/[&<>"']/g`) combined with a mapping dictionary reduces allocations and improves parsing speeds significantly (~15-20% faster).
**Action:** When performing multiple string replacements on the same target (especially in high-frequency loops or data ingestion pipelines), prefer a single RegExp match with a dictionary lookup function over chained string replacements.
## 2025-02-12 - Prevent StealTimer Interval Re-creation
**Learning:** In React components that rely on a global Zustand store for fast-changing state like countdown timers (`timerSeconds`), including that state in a `useEffect` dependency array causes the `setInterval` to be destroyed and recreated every single tick (e.g., every 1000ms). This leads to timer drift and unnecessary React re-renders.
**Action:** Move boundary logic (e.g., `if (newSeconds === 0) { ... }`) directly into the Zustand store's update action (`decrementTimer`). This allows the React component's `useEffect` to depend *only* on the active toggle (`timerActive`), allowing the interval to be created exactly once and run cleanly without interruption.

## 2024-05-19 - Extracted and Memoized Red Card Footer
**Learning:** In heavily interactive components like `ArenaBoard`, large static control sections (like the 5 Red Card buttons) can re-render unnecessarily on every turn change or timer tick, wasting cycles evaluating `useGameStore` selector results and diffing complex class strings.
**Action:** Extract large static button banks into isolated components wrapped in `React.memo()`. Push their specific state subscriptions (e.g., `setActiveRedCard`) directly into the extracted component to prevent the parent from tracking unused state updates.
## 2026-07-07 - [Cache Sanitization for Low-Cardinality Fields]
**Learning:** During large CSV parsing loops, applying regular expression replacements (like `sanitizeHTML`) to every row individually causes significant redundant allocations for fields that only contain a few unique values across the entire dataset (e.g., Difficulty, Category, Deck Theme).
**Action:** When parsing large datasets, use a local `Map` to memoize expensive string operations (like regex sanitization) on low-cardinality fields. This reduces allocations from O(n) per row to O(1) cache lookups after the initial unique values are processed.
## 2026-07-08 - Prevent Unnecessary Top-Level Re-Renders
**Learning:** Checking state conditions unconditionally like `{activeRedCard && <RedCardModal />}` inside the main `App.tsx` component forces the entire app and all of its heavy children components (like `ArenaBoard`) to re-render when that condition changes, even if the condition could just as easily be evaluated locally inside the child component.
**Action:** Extract conditionally rendered components so that their visibility conditions are checked internally by the component itself (e.g. by returning `null` locally). In `App.tsx`, removing the explicit condition and leaving the subscription in the component avoids triggering parent re-renders.
## 2024-07-30 - O(1) Indexed Lookups for Database Filtering
**Learning:** During queries to the question database, repeatedly iterating through the entire loaded array with O(N) operations like `array.filter` introduces unnecessary performance overhead as the dataset grows (e.g., getting questions by deck or domain).
**Action:** Move expensive data preparation tasks to the initial data ingestion/parsing phase by creating `Map` indices (e.g., `domainIndex`, `deckIndex`). This transforms runtime queries like `getQuestionsByDomain` from O(N) filters into O(1) direct Map lookups.
