const CACHE_NAME = 'amen-cache-v1';

// Укажи здесь файлы, которые надо закэшировать при первом заходе
const urlsToCache = [
  '/',
  '/index.html',
  '/dawn.webp',
  '/morning.webp',
  '/day.webp',
  '/sunset.webp',
  '/evening.webp',
  '/midnight.webp',
  // Впиши сюда все свои 9 видео, чтобы они скачались один раз
  '/vid1.mp4',
  '/vid2.mp4',
  '/vid3.mp4',
  '/vid4.mp4',
  '/vid5.mp4',
  '/vid6.mp4',
  '/vid7.mp4',
  '/vid8.mp4',
  '/vid9.mp4',
];

// Установка воркера и кэширование
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Перехват запросов
self.addEventListener('fetch', (event) => {
  // Для видео используем особую логику, чтобы не сломать стриминг
  if (event.request.headers.get('range')) {
      return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Если нашли в кэше — отдаем из кэша
        if (response) {
          return response;
        }
        // Иначе качаем из интернета
        return fetch(event.request);
      }
    )
  );
});

// Обновление кэша (удаление старого)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});