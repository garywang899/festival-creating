
// 临时禁用 SW 拦截，以彻底解决卡死问题
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('fetch', (event) => {
  // 不做任何拦截，直接透传网络请求
  return;
});
