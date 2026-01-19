const CACHE_NAME = 'amen-app-cache-v2';

// 1. При установке кэшируем "скелет" приложения
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Сразу активировать новый воркер
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html'
      ]);
    })
  );
});

// 2. Активация и удаление старых кэшей
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

// 3. Перехват запросов (Стратегия: Сначала Кэш, потом Сеть)
self.addEventListener('fetch', (event) => {
  // Игнорируем запросы к базе данных (Firebase сам их обрабатывает) и внешним API, кроме шрифтов
  const url = new URL(event.request.url);
  if (url.origin.includes('firestore') || url.origin.includes('googleapis') && !url.origin.includes('fonts')) {
    return;
  }

  // Для всего остального (картинки, скрипты, стили, html)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Если есть в кэше — отдаем мгновенно
      if (cachedResponse) {
        return cachedResponse;
      }

      // Если нет — идем в сеть, берем файл И сохраняем в кэш на будущее
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
        // Если сети нет и в кэше нет — можно вернуть заглушку, но для SPA обычно достаточно index.html
        if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
        }
      });
    })
  );
});
