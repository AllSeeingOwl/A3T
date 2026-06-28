## 2026-06-26 - Zustand Full Store Re-renders
**Learning:** Destructuring the entire `useGameStore()` in top-level and heavy components (`App`, `ArenaBoard`, etc.) was causing massive, codebase-wide unnecessary re-renders. Every time a localized state changed (like the fast-ticking `timerSeconds`), components that didn't need that data were forced to re-render.
**Action:** When extracting state from the Zustand store, always use specific selectors alongside `useShallow` from `zustand/react/shallow` to strictly bound subscriptions and avoid unnecessary React render cycles.

## 2024-06-27 - Initial Route Code Splitting
**Learning:** The single-page app previously loaded all components (Lobby, Arena, Summary, Modals) into the main bundle even though only LobbyHub is displayed initially. This increased initial load time and memory usage needlessly. However, when lazy-loading `RedCardModal`, the global Suspense boundary caused the entire `ArenaBoard` to disappear and show a loading screen while the modal chunk was fetched.
**Action:** Implemented React.lazy and Suspense in App.tsx to split route-level components into separate chunks. The main bundle `index.js` dropped from ~214KB to ~204KB. Kept `RedCardModal` eagerly loaded to avoid UX regressions when it is triggered, ensuring the active game board remains visible.

## 2024-06-28 - Fast-Changing State Extraction
**Learning:** Even with `useShallow`, if a component binds to a frequently updating state property (like a ticking `timerSeconds`), it will re-render on every update. In heavy parent components like `ArenaBoard`, this creates significant re-render overhead.
**Action:** When part of a UI requires fast-changing state, extract that specific UI into a small, isolated child component (`StealTimer`) and have *only* the child component subscribe to the fast-changing state via Zustand.
