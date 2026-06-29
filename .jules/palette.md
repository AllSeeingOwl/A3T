## 2026-06-26 - Accessible Reveal States
**Learning:** Using `group-hover` for revealing hidden information completely breaks keyboard accessibility, leaving non-mouse users unable to see critical game answers. Adding `group-focus` alongside `tabIndex={0}` is a simple, effective fix.
**Action:** Always pair hover-based reveals with focus states in Tailwind (`group-hover:opacity-0 group-focus:opacity-0`) and ensure the container is focusable.

## 2024-06-28 - Presenter Screen Reader Experience
**Learning:** When building an interface for a host or presenter (where answers are visually obfuscated from the audience via blur or opacity until hover/focus), wrapping the container in `role="button"` and `aria-label="Reveal Answer"` breaks accessibility for screen reader hosts. It causes the screen reader to announce "Reveal Answer, button" but swallows the actual answer text inside the container when focused.
**Action:** For visual obfuscation, keep the container focusable (`tabIndex={0}`) but omit the `role="button"` and `aria-label` so the internal text content remains accessible on focus. Add `aria-hidden="true"` to any visual instructions (like "Hover to reveal") so the screen reader host immediately hears the answer text rather than confusing visual directions.

## 2026-06-29 - Accessible Progress Pipelines
**Learning:** Custom visual progress pipelines using `div`s fail to communicate structural order to screen readers. They must utilize `<ol>` semantics and `aria-current` attributes to be fully accessible.
**Action:** Always use ordered lists (`<ol>`/`<li>`) combined with visually hidden (`sr-only`) text and `aria-current` for step/progress pipelines rather than flat decorative components.
