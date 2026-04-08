const CACHE_NAME = 'totem-camisetas-offline-v3'; // Versão atualizada para forçar a limpeza

// Ficheiros base essenciais para a aplicação iniciar offline
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
      console.log('Cache offline base aberta com sucesso');
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
          // Limpa versões de cache antigas quando atualizamos o CACHE_NAME
          if (cacheName !== CACHE_NAME) {
            console.log('A remover cache antiga:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// A MÁGICA OFFLINE: Interceta os pedidos à rede
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Se encontrou na memória (cache), devolve logo (não gasta internet e é super rápido)
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 2. Se não encontrou, tenta ir à internet
      return fetch(event.request).then((networkResponse) => {
        // Guarda as imagens do GitHub E TAMBÉM o QR Code gerado pela API!
        const url = event.request.url;
        if (url.includes('raw.githubusercontent.com') || url.includes('api.qrserver.com')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      });
    }).catch(() => {
      // Ocorre quando não tem internet e o ficheiro não está na cache
      console.log("Offline e recurso não encontrado na cache:", event.request.url);
    })
  );
});
