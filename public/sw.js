const CACHE_NAME = 'amen-app-v4'; // <-- ВАЖНО: Я изменил версию на v4

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

// 1. Установка
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Принудительно активируем новый воркер сразу
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. Активация (Удаление старого кэша)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Если имя кэша не совпадает с текущим (v4), удаляем его
          if (cacheName !== CACHE_NAME) {
            console.log('Amen SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim(); // Захватываем управление сразу
});

// 3. Перехват запросов
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Игнорируем базу данных и mp3
  if (url.origin.includes('firestore.googleapis.com') || url.pathname.endsWith('.mp3')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
        }
      });
    })
  );
});
