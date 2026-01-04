const CACHE_NAME = 'thinktank-cache-v1';
let offlineMode = false; // controlled by client via postMessage

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache minimal assets (index and app shell)
      return cache.addAll([
        '/',
        '/index.html',
      ]).catch(() => {
        // ignore failures
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', (event) => {
  const { type, enabled } = event.data || {};
  if (type === 'SET_OFFLINE_MODE') {
    offlineMode = !!enabled;
    // Optionally notify clients that SW received the mode
    event.source && event.source.postMessage({ type: 'OFFLINE_MODE_ACK', enabled: offlineMode });
  }
  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (offlineMode || !self.navigator.onLine) {
    // Serve from cache only when offline mode is explicitly enabled or browser is offline
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then(response => {
        // store successful GET responses in cache for later
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return response;
      }).catch(() => cached || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // Network-first, fallback to cache
  event.respondWith(
    fetch(req).then((response) => {
      // Save GET responses in cache
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
      return response;
    }).catch(() => caches.match(req).then((cached) => cached || new Response('Offline', { status: 503 })))
  );
});