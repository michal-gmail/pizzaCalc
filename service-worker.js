const VERSION = 'v4'; // 🔄 Zmena verzie

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => {
      return cache.addAll([
        "icon-192.png",
        "icon-512.png",
        "manifest.json",
      ]);
    })
  );
  self.skipWaiting(); // Okamžité aktivovanie nového SW
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          let responseClone = response.clone();
          caches.open(VERSION).then((cache) => {
            cache.put(event.request, responseClone);
          });

          // 🆕 Hneď po `fetch` pošli verziu klientovi
          sendVersionToClients();

          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// 🗑️ Vymazanie starej cache a oznámenie klientom
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== VERSION)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim().then(() => {
    sendVersionToClients();
  });
});

// 🆕 Funkcia na odoslanie verzie všetkým klientom
function sendVersionToClients() {
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({ version: VERSION });
    });
  });
}
