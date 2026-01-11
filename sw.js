
const CACHE_NAME = 'festive-fix-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(key => caches.delete(key)));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // 简单策略：优先网络，失败则寻找缓存
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
