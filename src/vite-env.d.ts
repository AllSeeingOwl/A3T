/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Sentry DSN for browser error reporting; read at build time. Unset = no Sentry. */
  readonly VITE_SENTRY_DSN?: string;
}
