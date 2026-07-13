// 🛡️ Sentinel: Enhanced centralized HTML sanitization utility.
// Extends baseline XSS protection by also escaping characters commonly used
// in advanced injection payloads (e.g., attribute injection, template literal execution).
// ⚡ Bolt Optimization: Uses a single-pass RegExp and dictionary lookup for performance.

const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

// ⚡ Bolt Optimization: Extract the regular expression outside the function scope.
// This prevents the JS engine from re-compiling and re-allocating the RegExp object
// on every single function call, which happens thousands of times during CSV parsing.
// eslint-disable-next-line no-useless-escape
const SANITIZE_REGEX = /[&<>"'`=\/]/g;

export const sanitizeHTML = (str: string): string => {
  if (!str) return '';
  return str.replace(SANITIZE_REGEX, (match) => HTML_ENTITIES[match]);
};
