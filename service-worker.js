const VERSION = 'v3';

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
            return response; // Ak je odpoveď neplatná, vráť ju rovno
          }
          let responseClone = response.clone(); // Klonujeme odpoveď
          caches.open(VERSION).then((cache) => {
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

  // Poslanie verzie klientom po aktivácii
  self.clients.claim().then(() => {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({ version: VERSION });
      });
    });
  });
});
