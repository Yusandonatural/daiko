/* 移転済み：古いキャッシュを消して 自分を解除し、ページを開き直す */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    (await caches.keys()).forEach((k) => caches.delete(k));
    await self.registration.unregister();
    (await self.clients.matchAll({ type: 'window' })).forEach((c) => c.navigate(c.url));
  })());
});
