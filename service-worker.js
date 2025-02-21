const VERSION = 'v3';

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
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
            return response; // Ak je odpoveď neplatná, vráť ju rovno
          }
          let responseClone = response.clone(); // Klonujeme odpoveď
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response; // Teraz je bezpečné vrátiť originál
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


// 🗑️ Vymažte starú cache pri aktivácii novej verzie
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim(); // Aktualizuje klientov okamžite
});

// Odošlite verziu do klienta
self.clients.matchAll().then(clients => {
  clients.forEach(client => {
      client.postMessage({ version: VERSION });
  });
});

// Odošlite správu klientom na obnovenie stránky
// clients.claim().then(() => {
//   return clients.matchAll().then(clients => {
//       clients.forEach(client => {
//           client.postMessage({ action: 'refresh' });
//       });
//   });
// });
