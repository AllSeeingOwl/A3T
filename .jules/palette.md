## 2026-06-26 - Accessible Reveal States
**Learning:** Using `group-hover` for revealing hidden information completely breaks keyboard accessibility, leaving non-mouse users unable to see critical game answers. Adding `group-focus` alongside `tabIndex={0}` is a simple, effective fix.
**Action:** Always pair hover-based reveals with focus states in Tailwind (`group-hover:opacity-0 group-focus:opacity-0`) and ensure the container is focusable.
