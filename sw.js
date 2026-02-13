const CACHE_NAME = 'pac-man-v1';
const urlsToCache = [
  './',
  './index.html',
  './index.js',
  './pacman.css',
  './Pacman.js',
  './GameBoard.js',
  './Ghost.js',
  './Cherry.js',
  './setup.js',
  './ghostmove.js',
  './touchControls.js',
  './manifest.json',
  './img/pinkGhost.png',
  './img/cherry.png',
  './sounds/munch.wav',
  './sounds/pill.wav',
  './sounds/eat_ghost.wav',
  './sounds/death.wav',
  './sounds/game_start.wav',
  './sounds/eat_cherry.mp3',
  './sounds/item.mp3',
  './sounds/danger.mp3'
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((err) => {
          console.log('Cache addAll error:', err);
          // Continue even if some assets fail to cache
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch events: serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }
        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            // Clone response to cache it
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            return caches.match(event.request);
          });
      })
  );
});
