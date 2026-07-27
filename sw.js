const CACHE_NAME = 'dictionary-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Загружаем только существующие файлы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Загружаем только те файлы, которые точно существуют
        return cache.addAll(urlsToCache).catch(err => {
          console.warn('Некоторые файлы не загружены:', err);
          // Продолжаем установку даже если часть файлов не загрузилась
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если файл есть в кеше - возвращаем его
        if (response) {
          return response;
        }
        // Иначе загружаем с сети
        return fetch(event.request).then(response => {
          // Проверяем, что ответ валидный
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // Кешируем ответ
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
  );
});
