const CACHE_NAME = 'amen-app-v6'; // <-- Поменял на v6, чтобы телефоны увидели обновление

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
];

// 1. Установка
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Принудительно активируем
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// 2. Активация и чистка старого кэша
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Amen SW: Cleaning old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Перехват запросов
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Не кэшируем базу данных и музыку (чтобы экономить память и видеть новые посты сразу)
  if (url.origin.includes('firestore.googleapis.com') || url.pathname.endsWith('.mp3')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Если есть в кэше — отдаем
      if (cachedResponse) {
        return cachedResponse;
      }
      // Если нет — качаем
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
        // Если оффлайн и страницы нет — отдаем главную (для SPA)
        if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
        }
      });
    })
  );
});
