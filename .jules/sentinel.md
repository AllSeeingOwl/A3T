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
## 2026-07-06 - [Centralized Enhanced HTML Sanitization]
**Vulnerability:** Duplicated and basic HTML sanitization functions (`sanitizeHTML`) existed across multiple files, only escaping standard HTML entities (`&`, `<`, `>`, `"`, `'`). This approach lacked protection against advanced XSS vectors like attribute injection and template literal execution.
**Learning:** Duplicating critical security functions, such as HTML sanitization, across the codebase makes maintaining consistent and robust security policies difficult. Furthermore, a baseline escaping mechanism is often insufficient against modern injection payloads utilizing characters like `/`, `=`, and `` ` ``.
**Prevention:** Centralize security-critical utilities into dedicated files (e.g., `src/utils/sanitize.ts`). Ensure HTML entity escaping covers a broader range of potentially dangerous characters to provide stronger defense-in-depth against XSS.
## 2026-07-07 - [Client-Side Clickjacking Protection]
**Vulnerability:** The application was vulnerable to Clickjacking because it could be framed by malicious third-party sites.
**Learning:** Due to GitHub Pages hosting limitations, server-side HTTP security headers like `X-Frame-Options` or CSP `frame-ancestors` cannot be enforced. Clickjacking protection must therefore rely on a client-side frame-busting script.
**Prevention:** Implement a resilient frame-busting script (`if (window.self !== window.top) ...`) at the application's entry point (`src/main.tsx`), ensuring a "fail secure" fallback (e.g., catching exceptions from sandboxed iframes) to prevent the application from rendering if it is embedded without authorization.
## 2026-07-08 - [Information Leakage in Error Logs]
**Vulnerability:** Detailed error logging during API requests and CSV parsing exposed stack traces, potentially sensitive Google Sheets API error responses, and raw data rows to CI/CD logs and browser consoles.
**Learning:** While detailed logging is useful for local debugging, leaving `console.error(error)` and `console.warn(row, e)` in production or CI-facing scripts violates the principle of failing securely. It can inadvertently expose internal architecture, dependency versions, or raw sensitive data.
**Prevention:** Implement "fail secure" error handling. Catch exceptions and log generic, safe error messages indicating the failure without dumping raw error objects, stack traces, or original data inputs into the console.
## 2025-02-28 - [Local Dev MIME Sniffing Prevention]
**Vulnerability:** Missing `X-Content-Type-Options: nosniff` header in Vite's local dev/preview servers could lead to MIME-sniffing vulnerabilities, where browsers incorrectly execute non-script files (like images or stylesheets) as scripts.
**Learning:** While meta tags handle CSP and referrers in SPAs, `X-Content-Type-Options` cannot be set via meta tags. It must be sent as an HTTP response header, which means configuring it explicitly in `vite.config.ts` for local tooling, even if production servers handle it differently.
**Prevention:** Always configure `server.headers` and `preview.headers` in Vite to include `X-Content-Type-Options: nosniff` to mirror production security standards and protect local dev environments.
## 2026-07-09 - [Defense in Depth: Removing innerHTML Sinks]
**Vulnerability:** Use of `innerHTML` in the client-side frame-busting script (`src/main.tsx`).
**Learning:** Even when the assigned string is static and seemingly harmless, `innerHTML` acts as a dangerous sink and is frequently flagged by security scanners as a potential DOM-based XSS vector. Replacing it with `textContent` removes the sink entirely, adhering to the principle of defense in depth. This ensures that future modifications (like adding dynamic data or localization) won't inadvertently introduce an XSS vulnerability.
**Prevention:** Avoid using `innerHTML` whenever possible, especially for static text or text that shouldn't contain HTML tags. Use `textContent` instead.

## 2026-07-11 - [Automated Subresource Integrity (SRI) Generation]
**Vulnerability:** Built HTML files referenced Javascript and CSS assets without `integrity` attributes. If the hosting CDN were compromised, an attacker could replace these assets with malicious code that the browser would blindly execute, leading to XSS or data exfiltration.
**Learning:** Subresource Integrity (SRI) hashes ensure browsers only execute files that exactly match the expected cryptographic hash generated at build time. Using a Vite plugin automates this process without developer overhead.
**Prevention:** Utilize `vite-plugin-sri-gen` in Vite build pipelines to automatically compute and inject `integrity` hashes into production HTML.
## 2024-07-13 - [Client-Side DoS via Unbounded Input Sanitization]
**Vulnerability:** The application accepted team names from text inputs and sanitized them (`sanitizeHTML`) before applying a length limit (`substring(0, 50)`). If a user bypassed the HTML `maxLength` attribute, they could submit a string with millions of characters, locking the browser's main thread during the global regex replacement and causing a client-side Denial of Service (DoS).
**Learning:** HTML `maxLength` attributes are not a security boundary and can be easily bypassed. Expensive operations like global regex replacements must be bounded by length limits *before* execution.
**Prevention:** Always apply length limits (`substring()`) to user input *before* passing it to potentially expensive sanitization or validation functions.
## 2024-07-13 - [Dangerous Anti-Pattern: Truncation Before Sanitization]
**Vulnerability:** Attempting to prevent ReDoS by truncating input (`substring(0, 50)`) *before* applying an HTML sanitizer (`sanitizeHTML`) introduces a severe Cross-Site Scripting (XSS) bypass.
**Learning:** If an input like `<img src=x onerror=alert(1)               >` is truncated at 50 characters, the closing `>` is removed. The sanitizer's regex may fail to match and strip the incomplete tag, but the browser will still execute it when injected into the DOM. Additionally, entity encoding expands string lengths, so truncating before encoding breaks length constraints.
**Prevention:** Never arbitrarily truncate strings *before* sanitization. If an input is excessively long (DoS risk), reject it entirely or fallback to a safe default before processing, rather than slicing it mid-payload.

## 2026-07-13 - [Cross-Origin Isolation for Dev/Preview Servers]
**Vulnerability:** The local development and preview servers were lacking Cross-Origin Isolation headers (`Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy`), potentially exposing the environment to side-channel information leaks (e.g., Spectre-like attacks).
**Learning:** While meta tags handle some security aspects for SPAs, Cross-Origin Isolation must be enforced via HTTP response headers. Explicitly configuring COOP and COEP in Vite mirrors advanced production security standards and hardens the local tooling against sophisticated cross-origin attacks.
**Prevention:** Always configure `server.headers` and `preview.headers` in `vite.config.ts` to include `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`.

## 2026-07-14 - [Content Security Policy Resource Limits]
**Vulnerability:** The application's Content Security Policy lacked directives to restrict iframes and web workers.
**Learning:** Adding `frame-src 'none'` and `worker-src 'none'` prevents the application from embedding malicious iframes or spawning unauthorized web workers in the event of an XSS attack.
**Prevention:** Always include `frame-src 'none'` and `worker-src 'none'` in the base Content Security Policy for Single Page Applications to provide robust defense in depth.
