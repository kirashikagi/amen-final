const CACHE_NAME = 'amen-app-v3'; // Версия кэша. Меняйте цифру, когда обновляете картинки/код.

// Список самых важных файлов, которые нужно скачать сразу
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.png'
  // Если ваши фоны лежат в public, лучше добавить их сюда явно, например:
  // '/dawn.jpg',
  // '/day.jpg',
  // '/sunset.jpg',
  // ...
];

// 1. Установка (Install): Кэшируем "скелет"
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Заставляет браузер немедленно использовать этот новый воркер
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// 2. Активация (Activate): Удаляем старый кэш (чтобы обновить фоны у пользователей)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Amen SW: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Перехват запросов (Fetch): Стратегия "Кэш, потом Сеть"
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Игнорируем запросы к базе данных Firebase (Firebase SDK сам их кэширует через IndexedDB)
  // Игнорируем загрузку музыки (слишком тяжелая для авто-кэша)
  if (url.origin.includes('firestore.googleapis.com') || url.pathname.endsWith('.mp3')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // А. Если файл есть в памяти телефона — отдаем мгновенно
      if (cachedResponse) {
        return cachedResponse;
      }

      // Б. Если нет — идем в интернет
      return fetch(event.request).then((networkResponse) => {
        // Проверяем, что ответ нормальный
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // В. Сохраняем скачанный файл в кэш на будущее
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Г. Если интернета нет и файла нет в кэше — возвращаем главную страницу (чтобы не было "динозаврика")
        if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
        }
      });
    })
  );
});
