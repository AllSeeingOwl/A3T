// Sentry error reporting for the browser.
// VITE_SENTRY_DSN is read at build time: the Render build sets it, while
// GitHub Pages and local builds don't, so their output contains no Sentry code.
export async function initSentry(): Promise<void> {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return;

  const Sentry = await import('@sentry/browser');
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    // Sentry v11 collects user info (including IP addresses), cookies, headers,
    // query strings and request bodies by default. All of it stays out of Sentry.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
    },
  });
}
