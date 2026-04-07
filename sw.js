const CACHE_NAME = 'totem-camisetas-offline-v1';

// Arquivos base para funcionar offline
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
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
  self.clients.claim();
});

// A MÁGICA OFFLINE ACONTECE AQUI
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Se achou na memória (cache), devolve na hora (não gasta internet)
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 2. Se não achou, vai na internet buscar
      return fetch(event.request).then((networkResponse) => {
        // Se for uma imagem do seu GitHub, guarda na memória para a próxima vez
        if (event.request.url.includes('raw.githubusercontent.com')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Se não tiver internet e não achar na memória, não quebra a página
      console.log("Sem conexão para carregar:", event.request.url);
    })
  );
});
