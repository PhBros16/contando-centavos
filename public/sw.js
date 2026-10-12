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
  // Só intercepta pedidos de leitura (GET) da própria origem. Deixa
  // chamadas de escrita (POST/PUT/PATCH/DELETE — login, cadastro, salvar
  // transação etc.) e qualquer coisa de outro domínio (API do Supabase)
  // passarem direto, sem passar pelo service worker.
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      // Nada aqui é efetivamente armazenado em cache hoje (não há nenhum
      // "cache.put" no projeto), então caches.match() sempre resolve pra
      // undefined quando a rede falha — e devolver undefined pro
      // navegador quebra com "Returned response is null", transformando
      // todo soluço de rede num erro fatal em vez de uma falha comum.
      const cached = await caches.match(event.request);
      return (
        cached ??
        new Response("Sem conexão no momento. Tente de novo.", {
          status: 503,
          statusText: "Offline",
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        })
      );
    })
  );
});

// ---- Notificações push ----
self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Meus Centavos";
  const options = {
    body: data.body || "Você tem uma atualização financeira.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: { url: data.url || "/dashboard" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
