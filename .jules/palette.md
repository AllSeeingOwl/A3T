## 2026-06-26 - Accessible Reveal States
**Learning:** Using `group-hover` for revealing hidden information completely breaks keyboard accessibility, leaving non-mouse users unable to see critical game answers. Adding `group-focus` alongside `tabIndex={0}` is a simple, effective fix.
**Action:** Always pair hover-based reveals with focus states in Tailwind (`group-hover:opacity-0 group-focus:opacity-0`) and ensure the container is focusable.

## 2024-06-28 - Presenter Screen Reader Experience
**Learning:** When building an interface for a host or presenter (where answers are visually obfuscated from the audience via blur or opacity until hover/focus), wrapping the container in `role="button"` and `aria-label="Reveal Answer"` breaks accessibility for screen reader hosts. It causes the screen reader to announce "Reveal Answer, button" but swallows the actual answer text inside the container when focused.
**Action:** For visual obfuscation, keep the container focusable (`tabIndex={0}`) but omit the `role="button"` and `aria-label` so the internal text content remains accessible on focus. Add `aria-hidden="true"` to any visual instructions (like "Hover to reveal") so the screen reader host immediately hears the answer text rather than confusing visual directions.

## 2026-06-29 - Accessible Progress Pipelines
**Learning:** Custom visual progress pipelines using `div`s fail to communicate structural order to screen readers. They must utilize `<ol>` semantics and `aria-current` attributes to be fully accessible.
**Action:** Always use ordered lists (`<ol>`/`<li>`) combined with visually hidden (`sr-only`) text and `aria-current` for step/progress pipelines rather than flat decorative components.
\n## 2024-10-24 - Communicating Visual-Only Game State\n**Learning:** When game state such as "active turn" is communicated entirely via visual cues (like borders, shadows, or background colors on a scoreboard), screen reader users are completely left in the dark about whose turn it is or when it changes.\n**Action:** Always complement visual-only state indicators with `sr-only` text (e.g., "(Current Turn)") and use `aria-live="polite"` on scoreboards so changes are announced as they occur.
## 2024-07-02 - Added Dialog Role and AutoFocus to RedCard UI
**Learning:** React conditionally rendered component triggers (e.g. RedCardGuide trigger button unmounting) can drop keyboard focus to the document body when removed, preventing screen readers and keyboard users from easily entering the freshly opened modal/drawer unless a primary action is immediately given `autoFocus`.
**Action:** Always add `autoFocus` on the primary close/action button when a conditionally-rendered modal or overlay unmounts the trigger element that opened it.

## 2024-07-03 - Decorative SVG Screen Reader Annoyance
**Learning:** Decorative inline `<svg>` and icon components (like `lucide-react`) used as pure decoration without explicit `aria-hidden="true"` can be inconsistently parsed by screen readers or cause unnecessary pauses in narration.
**Action:** Always add `aria-hidden="true"` to purely decorative SVG elements and icon-only components that are within larger labeled controls or serve as background visuals, so they do not pollute the accessibility tree.

## 2024-11-20 - Keyboard Navigation for Dialogs
**Learning:** Custom React modals and side-drawers (like RedCardModal and RedCardGuide) that lack built-in `<dialog>` semantics often trap keyboard-only users if they don't support the `Escape` key to close.
**Action:** Always implement a `keydown` listener for the `Escape` key to close custom overlays/dialogs, ensuring they match standard browser accessibility expectations.

## 2024-07-06 - Summary Podiums Context
**Learning:** Purely visual representations of rank (like a podium displaying '1' or '2' with different heights) and unlabelled score numbers lose all context when read by a screen reader.
**Action:** Always provide `sr-only` labels for final scores and translate visual ranking placements (e.g., '1') into explicit contextual text (e.g., '1st Place') alongside an `aria-hidden` visual element.
