const CACHE_NAME = 'amen-app-v35-INLINE-FOCUS'; 

self.addEventListener('install', (event) => {
  self.skipWaiting(); 
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
    })
  );
  return self.clients.claim(); 
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // КРИТИЧЕСКИ ВАЖНО: Не трогаем базу данных и музыку!
  if (url.origin.includes('firestore.googleapis.com') || url.pathname.endsWith('.mp3')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
