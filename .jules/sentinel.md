## 2025-02-20 - [Content Security Policy Implementation]
**Vulnerability:** Missing security headers (CSP) in the root HTML file exposed the application to potential Cross-Site Scripting (XSS).
**Learning:** Client-side only applications still require robust browser-level protections. Implementing a CSP via meta tags provides an immediate defense-in-depth layer when server-side headers are not configurable. X-Content-Type-Options cannot be set via meta tags.
**Prevention:** Always include a baseline `Content-Security-Policy` in `index.html` for single-page applications.
## 2025-02-28 - [Tighten Content Security Policy]
**Vulnerability:** The 'unsafe-eval' directive was present in the Content Security Policy, which is a common vector for Cross-Site Scripting (XSS) attacks. Additionally, missing 'object-src' and 'base-uri' directives left the application open to plugin-based injections and base tag hijacking.
**Learning:** React/Vite applications generally do not require 'unsafe-eval' in production. Adding 'object-src \'none\'' and 'base-uri \'self\'' are essential defense-in-depth measures to restrict potential attack vectors.
**Prevention:** Always verify if 'unsafe-eval' is strictly necessary and enforce strict 'object-src' and 'base-uri' directives in CSPs.
