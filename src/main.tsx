import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// 🛡️ Sentinel: Frame-busting script to prevent Clickjacking.
// Since GitHub Pages only allows meta tags and CSP 'frame-ancestors'
// is ignored in meta tags, we must rely on client-side frame-busting
// to prevent the application from being embedded in an unauthorized iframe.
if (window.self !== window.top && window.top) {
  try {
    window.top.location.href = window.self.location.href;
  } catch {
    // If we're blocked from accessing top (e.g. cross-origin),
    // we can fallback to replacing the document body or hiding it.
    document.body.textContent = 'This application cannot be embedded in a frame.';
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
