import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/A3T/',
  // 🛡️ Sentinel: Enforce strict MIME-type checking during local development and previews
  // to prevent MIME-sniffing vulnerabilities. This mitigates risks where the browser
  // might incorrectly interpret non-executable files as executable scripts.
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
    },
  },
});
