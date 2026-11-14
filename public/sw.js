const CACHE_NAME = 'amen-cache-v5';

const urlsToCache = [
  '/',
  '/index.html',
  '/dawn.webp',
  '/morning.webp',
  '/day.webp',
  '/sunset.webp',
  '/evening.webp',
  '/midnight.webp',
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  if (request.method !== 'GET' || request.headers.get('range') || requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    try {
      const response = await fetch(request);
      const isAppAsset = ['script', 'style', 'image', 'font', 'document'].includes(request.destination);
      if (response.ok && isAppAsset) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const offlinePage = await caches.match('/index.html');
        if (offlinePage) return offlinePage;
      }
      throw error;
    }
  })());
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
