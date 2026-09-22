import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker (only in production; in dev mode, unregister and clear stale caches)
if ('serviceWorker' in navigator) {
  const isDev = Boolean((import.meta as any).env?.DEV);
  if (isDev) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('MockTrack PWA Service Worker active with scope:', registration.scope);
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration error:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
