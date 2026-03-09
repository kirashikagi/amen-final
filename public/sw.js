const CACHE_NAME = 'amen-cache-v4';

const urlsToCache = [
  '/',
  '/index.html',
  '/dawn.webp',
  '/morning.webp',
  '/day.webp',
  '/sunset.webp',
  '/evening.webp',
  '/midnight.webp',
  '/vid1.mp4',
  '/vid4.mp4',
  '/vid5.mp4',
  '/vid6.mp4',
  '/vid7.mp4',
  '/vid9.mp4'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.headers.get('range')) return; 

  event.respondWith(
    caches.match(event.request).then((response) => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});

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