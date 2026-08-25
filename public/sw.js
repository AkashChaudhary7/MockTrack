const STATIC_CACHE_NAME = 'mocktrack-static-v3';
const DATA_CACHE_NAME = 'mocktrack-data-v3';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-icon-512.png',
  '/icon.svg',
  '/screenshot-desktop.png',
  '/screenshot-mobile.png',
  '/privacy',
  '/privacy.html'
];

// Install Event - Precache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== STATIC_CACHE_NAME && cache !== DATA_CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Helper function to check if request is for a static asset
function isStaticAsset(url, request) {
  const path = url.pathname;
  if (/\.(png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2|ttf|otf|eot|map|json)$/i.test(path)) {
    return true;
  }
  if (path.startsWith('/assets/')) {
    return true;
  }
  if (['style', 'script', 'image', 'font'].includes(request.destination)) {
    return true;
  }
  return false;
}

// Fetch Event
// Static assets: Cache-First strategy
// Data fetches & Navigation: Network-First strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  if (!url.protocol.startsWith('http')) return;

  // 1. Cache-First Strategy for Static Assets
  if (isStaticAsset(url, event.request)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Revalidate in background for potential updates
          fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          }).catch(() => {/* network offline */});
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // 2. Network-First Strategy for Data Fetches and Navigation
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(DATA_CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
            return caches.match('/index.html') || caches.match('/');
          }
          return new Response(JSON.stringify({ error: 'Offline mode: data unavailable' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
  );
});

// Push & Notification Listener for Play Store readiness
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.text() : 'MockTrack Notification';
  event.waitUntil(
    self.registration.showNotification('MockTrack', {
      body: data,
      icon: '/icon-192.png',
      badge: '/icon-192.png'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
