## 2025-02-20 - [Content Security Policy Implementation]
**Vulnerability:** Missing security headers (CSP) in the root HTML file exposed the application to potential Cross-Site Scripting (XSS).
**Learning:** Client-side only applications still require robust browser-level protections. Implementing a CSP via meta tags provides an immediate defense-in-depth layer when server-side headers are not configurable. X-Content-Type-Options cannot be set via meta tags.
**Prevention:** Always include a baseline `Content-Security-Policy` in `index.html` for single-page applications.
