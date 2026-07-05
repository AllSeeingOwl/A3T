## 2025-02-20 - [Content Security Policy Implementation]
**Vulnerability:** Missing security headers (CSP) in the root HTML file exposed the application to potential Cross-Site Scripting (XSS).
**Learning:** Client-side only applications still require robust browser-level protections. Implementing a CSP via meta tags provides an immediate defense-in-depth layer when server-side headers are not configurable. X-Content-Type-Options cannot be set via meta tags.
**Prevention:** Always include a baseline `Content-Security-Policy` in `index.html` for single-page applications.
## 2025-02-28 - [Tighten Content Security Policy]
**Vulnerability:** The 'unsafe-eval' directive was present in the Content Security Policy, which is a common vector for Cross-Site Scripting (XSS) attacks. Additionally, missing 'object-src' and 'base-uri' directives left the application open to plugin-based injections and base tag hijacking.
**Learning:** React/Vite applications generally do not require 'unsafe-eval' in production. Adding 'object-src \'none\'' and 'base-uri \'self\'' are essential defense-in-depth measures to restrict potential attack vectors.
**Prevention:** Always verify if 'unsafe-eval' is strictly necessary and enforce strict 'object-src' and 'base-uri' directives in CSPs.
## 2024-05-24 - [Escape, Don't Destroy HTML in Game Data]
**Vulnerability:** XSS vulnerability via external CSV upload (`data/questions.csv`) if parsed without sanitization.
**Learning:** While stripping HTML tags (`str.replace(/[<>]/g, '')`) prevents XSS, it is a destructive operation that corrupts legitimate game data (like math formulas or programming snippets containing `<` or `>`).
**Prevention:** Use an HTML escaping function (converting `<` to `&lt;`, etc.) to sanitize text meant for display. This neutralizes the XSS threat while preserving the integrity of the trivia content.

## 2024-07-01 - [Vite CSP Production Security]
**Vulnerability:** Weak Content-Security-Policy (CSP) allowing `'unsafe-inline'` for `script-src` in `index.html`.
**Learning:** While `'unsafe-inline'` scripts might be necessary for certain Vite development server features, Vite production builds compile and inject module scripts standardly and do not fundamentally require `'unsafe-inline'` to function securely. Leaving it in production needlessly weakens defense-in-depth against XSS.
**Prevention:** Ensure CSP meta tags manually defined in `index.html` are strictly configured for the production environment, omitting `'unsafe-inline'` for `script-src` unless specifically required by a third-party script.
## 2025-02-28 - [Form Hijacking and Mixed Content Protection]
**Vulnerability:** The application's Content Security Policy lacked directives to restrict form submissions and upgrade insecure requests. Even in pure client-side SPAs, an injected form could exfiltrate data, and missing HTTPS enforcement risks data interception.
**Learning:** Adding `form-action 'none'` prevents HTML forms from navigating away or submitting data, which is ideal for React SPAs that handle all submissions via JavaScript. `upgrade-insecure-requests` and `block-all-mixed-content` ensure that HTTPS is always enforced and mixed content is blocked by the browser.
**Prevention:** Always include `form-action 'none'`, `upgrade-insecure-requests`, and `block-all-mixed-content` in the base Content Security Policy for Single Page Applications to provide robust defense in depth.

## 2026-07-05 - [Dependency Management and Local Tooling Security]
**Vulnerability:** Known CVEs in local development and build tooling (vite, vitest, esbuild) exposed via `pnpm audit`.
**Learning:** While vulnerabilities in devDependencies often do not affect the shipped production bundle, they still expose local developer machines and CI/CD pipelines to potential exploits (like path traversals or local server data leaks).
**Prevention:** Keep build and test tooling proactively updated, and regularly monitor `pnpm audit` even for non-production dependencies.
