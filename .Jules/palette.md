## 2024-05-18 - Avoid Blanket `aria-label` Overrides
**Learning:** Overriding visible text on a button with a blanket `aria-label` (e.g., button says "Finish Match", `aria-label` says "End Game and View Summary") breaks voice-control software. Voice users will attempt to command the button using its visible text, which will fail if the accessible name does not contain that text.
**Action:** Instead of `aria-label`, allow the visible text to form the accessible name. Add contextual descriptions by appending text inside `<span className="sr-only">`. If formatting elements exist, hide them with `aria-hidden="true"`.

## 2025-05-18 - Hardware Device Access UI Freezes
**Learning:** Initiating hardware device access (like using `Html5Qrcode` or `navigator.mediaDevices.getUserMedia`) often prompts the user for OS-level permissions. During this time, the JS execution and UI appear frozen. Without explicit feedback, users may think the application has crashed.
**Action:** Always wrap hardware initiation logic in an explicit loading state (e.g., `isLoading = true`) and render an accessible `role="status"` loading spinner until the promise fully resolves (either success or failure).
