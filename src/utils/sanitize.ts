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

export const sanitizeHTML = (str: string): string => {
  if (!str) return '';
  // eslint-disable-next-line no-useless-escape
  return str.replace(/[&<>"'`=\/]/g, (match) => HTML_ENTITIES[match]);
};
