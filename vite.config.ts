import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sri from 'vite-plugin-sri-gen';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 🛡️ Sentinel: Generates Subresource Integrity (SRI) hashes for output files.
    // This ensures that if the CDN serving these files is compromised, the browser
    // will refuse to execute modified scripts or load altered stylesheets,
    // providing strong defense-in-depth against third-party asset tampering.
    sri()
  ],
  base: '/A3T/',
  // 🛡️ Sentinel: Enforce strict MIME-type checking during local development and previews
  // to prevent MIME-sniffing vulnerabilities. This mitigates risks where the browser
  // might incorrectly interpret non-executable files as executable scripts.
  // Additionally, apply COOP and COEP to enforce Cross-Origin Isolation, protecting
  // against side-channel attacks like Spectre.
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
  preview: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
