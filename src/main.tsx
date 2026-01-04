
  import { createRoot } from "react-dom/client";
  import App from "./App";
  import "./index.css";
  import { storage } from './utils/storage';

  createRoot(document.getElementById("root")!).render(<App />);

  // Register service worker and send current offline mode preference
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('Service worker registered:', reg);
      const enabled = storage.getOfflineMode();
      // If a controller exists, send the current setting
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SET_OFFLINE_MODE', enabled });
      }

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              // Re-send preferred mode after activation
              if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SET_OFFLINE_MODE', enabled });
              }
            }
          });
        }
      });
    }).catch(err => console.warn('Service worker registration failed:', err));

    navigator.serviceWorker.addEventListener('message', (event) => {
      // For now we only log acknowledgements from SW
      const { type, enabled } = event.data || {};
      if (type === 'OFFLINE_MODE_ACK') {
        console.log('SW acknowledged offline mode:', enabled);
      }
    });
  }