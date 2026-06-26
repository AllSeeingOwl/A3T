## 2026-06-26 - Zustand Full Store Re-renders
**Learning:** Destructuring the entire `useGameStore()` in top-level and heavy components (`App`, `ArenaBoard`, etc.) was causing massive, codebase-wide unnecessary re-renders. Every time a localized state changed (like the fast-ticking `timerSeconds`), components that didn't need that data were forced to re-render.
**Action:** When extracting state from the Zustand store, always use specific selectors alongside `useShallow` from `zustand/react/shallow` to strictly bound subscriptions and avoid unnecessary React render cycles.
