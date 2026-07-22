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
## 2024-07-07 - CSS-only Tooltips for Icon Buttons
**Learning:** Using native HTML `title` attributes on icon buttons with existing `aria-label`s provides poor UX due to delayed native tooltips and potential screen reader redundancy.
**Action:** Always implement custom CSS-based tooltips (e.g., via Tailwind `group-hover`) accompanied by `aria-hidden="true"` inside the tooltip element. This ensures instant visual feedback for sighted users while preserving the primary `aria-label` for screen reader accessibility.
## 2024-07-08 - Accessible Tooltips for Disabled Buttons
**Learning:** Adding custom CSS tooltips (using Tailwind `group-hover` and `group-focus-within`) to disabled buttons requires linking the tooltip to the button via `aria-describedby` so screen readers narrate the reason for the disabled state, improving accessibility over native `title` attributes. Additionally, ensuring the tooltip container itself is centered (`left-1/2 -translate-x-1/2`) is crucial when using centered pointer arrows.
**Action:** Always use `aria-describedby` to link disabled buttons with their custom CSS tooltips, and verify centering classes are applied to the tooltip container, not just its pointer arrow.

## 2024-11-21 - Accessible Selection States
**Learning:** Using color (like \`border-arena-gold\`) and minor CSS transformations (like \`scale-105\`) as the *only* visual indicators for a selected state violates WCAG 1.4.1 (Use of Color), leaving users with color vision deficiencies struggling to identify active selections.
**Action:** Always complement color-based state changes with an explicit, semantic visual indicator (like a checkmark icon or explicit text) to guarantee the state is perceivable to all users.
## 2026-07-11 - Accessible Custom Modals
**Learning:** Custom modal dialogs without native `<dialog>` tags fail screen reader and keyboard accessibility standards if they lack explicit ARIA semantics (`role="dialog"`, `aria-modal="true"`) and if they do not automatically grab focus upon opening.
**Action:** Always add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` to custom modal containers. Furthermore, always ensure the most appropriate element (like a cancel/close button or a primary input) utilizes `autoFocus` so keyboard focus is trapped or naturally enters the modal.

## 2024-07-12 - Ensure explicit ARIA labels on all structural and modal buttons
**Learning:** Modals with purely textual buttons or those implying action via visual context might still lack the descriptive text required for screen readers, or use improper default text, although standard best practices exist.
**Action:** Always provide explicit descriptive `aria-label`s for internal structural buttons and modals where context is missing, for example the "Cancel Easy Mode Selection" button.
## 2024-07-12 - Prevent overriding complex button content with aria-labels
**Learning:** Applying an `aria-label` to a complex component acting as a button completely masks its internal content. For instance, putting an `aria-label` on a deck selection card means screen readers will not read the description or any other embedded information within that button.
**Action:** Instead of applying an `aria-label` to the outer button, inject visually hidden text (`<span className="sr-only"></span>`) next to the primary label within the button to provide context while preserving the rest of the button's internal structure.
## 2024-07-13 - Visual Keyboard Shortcut Discoverability
**Learning:** Hiding keyboard shortcuts in plain text (e.g., "Cancel (Esc)") reduces their discoverability and cognitive recognition as actionable shortcuts, whereas styling them as semantic `<kbd>` elements provides immediate visual affordance to power users.
**Action:** Always wrap explicit keyboard shortcut hints in semantically correct and visually distinct `<kbd>` elements when communicating them in UI text or tooltips, and update standard `aria-label` text to be spelled out (e.g., "(Escape)") for proper screen reader pronunciation.
## 2024-07-14 - Semantic Radio Selection Groups
**Learning:** Using an array of `button` elements with `aria-pressed` to act as mutually exclusive options (like deck selection) is semantically incorrect and breaks native keyboard navigation (arrow keys to switch options). The classic fix required custom Javascript or complex "fake radio" CSS.
**Action:** Always use a semantically correct `<fieldset>` containing visually hidden (`sr-only`) native `<input type="radio">` buttons wrapped in `<label>`s. Tailwind's `has-[:focus-visible]` selector applied to the `<label>` allows you to maintain the exact same complex visual focus styling seamlessly, without writing custom Javascript for keyboard support.
## 2024-07-15 - Announcing Dynamic Content Changes
**Learning:** In highly dynamic React applications (like a trivia game), updating text content (like a question) in place does not automatically notify screen readers, leaving users stranded if they don't manually re-read the page.
**Action:** Always wrap dynamically updating text containers with `aria-live="polite"` and `aria-atomic="true"` to ensure screen readers automatically announce the new content to users when state changes.
## 2024-07-16 - Radio Button Visual Affordance
**Learning:** Using purely empty space for unselected custom radio cards (like deck selection) forces users to guess the interaction model, whereas explicitly showing an empty circle provides immediate mental mapping to standard radio button behavior.
**Action:** Always provide an explicit empty state indicator (like an empty circle icon) for unselected items within custom radio button groups or selection cards to improve visual affordance.
## 2024-07-16 - Input Focus Auto-selection
**Learning:** Forcing a user to manually highlight or backspace pre-filled default text (like default team names) is tedious. Selecting the text automatically upon focus drastically improves the micro-interaction.
**Action:** Always add `onFocus={(e) => e.target.select()}` to text inputs that are pre-filled with temporary default values that users are highly likely to overwrite.
## 2024-11-22 - Prevent Accidental Destructive Actions\n**Learning:** Destructive actions hidden behind simple single-click buttons (like 'Finish Match' ending a game instantly) cause user frustration and accidental state loss.\n**Action:** Always add an explicit confirmation step (like a native `window.confirm` dialog or custom modal) to irreversible or destructive UI actions.
## 2024-07-26 - Accessible Destructive Actions
**Learning:** Post-game destructive actions like "Play Again" or ending a tiebreaker can easily wipe out game state. Adding a simple confirmation step prevents accidental loss.
**Action:** Use native window.confirm() or a custom confirmation dialog for all destructive actions to prevent frustrating mistakes, following the pattern from the "Finish Match" button.

## 2024-07-26 - Accessible Screen Reader Announcements for Dynamic Components
**Learning:** During highly dynamic end states (like a sudden death tiebreaker conclusion), newly displayed visual text ("Winner Declared!") must be explicitly announced to screen readers.
**Action:** Use `aria-live="polite"` and `aria-atomic="true"` on dynamically appearing winner announcements so they are narratively announced as soon as they mount into the DOM.
## 2024-07-28 - Isolating Character Count State
**Learning:** Adding local interactive state (like character counters) to large UI components that have been explicitly optimized with `useRef` to prevent performance issues (e.g. `LobbyHub.tsx`) can cause massive unnecessary re-renders across the page on every keystroke.
**Action:** When adding high-frequency state like character counters to heavily optimized parents, isolate the input and its localized state into a separate child component (`TeamInput`) rather than reverting the parent back to `useState`.

## 2026-07-20 - Accessible Icon-Only Buttons in Lists
**Learning:** Using native HTML `title` attributes on icon-only action buttons (like checklist controls) in dense lists creates poor UX due to delayed native tooltips, and fails screen reader standards by causing redundant narration when an `aria-label` is also present.
**Action:** Always replace native `title` attributes on icon-only buttons with custom CSS-based tooltips (e.g. Tailwind `group-hover`). Add `aria-hidden="true"` to the tooltip content to hide it from screen readers, relying entirely on the parent button's `aria-label` for accessible context.
## 2024-11-23 - Accessible Inputs via aria-label
**Learning:** Relying solely on `placeholder` attributes for text inputs and textareas (like the custom answers input in TiebreakerScreen) is a known accessibility anti-pattern because the placeholder is often not announced correctly by screen readers as an accessible name, and it disappears when text is entered.
**Action:** Always provide an explicit `aria-label` for text inputs and textareas that do not have an associated visible `<label>`, ensuring the element maintains a valid accessible name for screen readers regardless of its content.
## 2024-07-28 - Keyboard Accessible Scrollable Regions
**Learning:** Custom scrollable regions (like overflow lists in modals or side drawers) that lack interactive child elements can become inaccessible traps for keyboard-only users, as they cannot naturally focus and scroll the container using arrow keys or Page Up/Down.
**Action:** Always ensure custom scrollable regions (e.g., containers with `overflow-y-auto`) remain keyboard accessible by explicitly adding `tabIndex={0}` along with standard focus indicators (like `focus-visible:ring-2`) so users can navigate to and scroll through the content.
