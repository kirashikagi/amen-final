// ВАЖНО: Мы изменили версию на v2. 
// В будущем, если будешь менять видео или картинки, просто меняй тут цифру (v3, v4 и т.д.)
const CACHE_NAME = 'amen-cache-v2';

const urlsToCache = [
  '/',
  '/index.html',
  // Убедись, что твои картинки теперь в формате webp
  '/dawn.webp',
  '/morning.webp',
  '/day.webp',
  '/sunset.webp',
  '/evening.webp',
  '/midnight.webp',
  // Твои 9 видеофонов
  '/vid1.mp4',
  '/vid2.mp4',
  '/vid3.mp4',
  '/vid4.mp4',
  '/vid5.mp4',
  '/vid6.mp4',
  '/vid7.mp4',
  '/vid8.mp4',
  '/vid9.mp4'
];

self.addEventListener('install', (event) => {
  // Форсируем установку нового воркера
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Пропускаем запросы с range (чтобы не сломать стриминг видео/аудио на iOS)
  if (event.request.headers.get('range')) {
      return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response; // Отдаем из кэша моментально
        }
        return fetch(event.request); // Или качаем из сети, если в кэше нет
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Удаляем все старые версии кэша (v1), чтобы освободить память на телефоне
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Заставляем новый SW сразу взять управление
  );
});