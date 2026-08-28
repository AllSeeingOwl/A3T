## 2023-11-20 - [Explicit button types]
**Learning:** React defaults `<button>` elements to `type="submit"` when placed inside a form. The app contains `<button>` tags lacking a type attribute scattered across components like `ArenaBoard` and `TiebreakerScreen`. If these are later nested inside forms for layout reasons, they could trigger unexpected form submissions and reload the page.
**Action:** Added explicit `type="button"` attributes to all non-submission buttons across the repository.
