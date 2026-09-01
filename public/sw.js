// Service worker mínimo — o objetivo aqui não é cache offline sofisticado,
// é só satisfazer o critério de instalabilidade do Chrome/Android
// (que exige um SW com handler de fetch registrado).
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
