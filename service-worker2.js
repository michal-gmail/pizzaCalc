const CACHE_NAME = 'pizzaCalc-app-v2'; // Zmeň číslo verzie

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("pwa-cache2").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/icon-192.png",
        "/icon-512.png",
        "/manifest.json",
        "/style.css",
        "/script.js"
      ]);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
});
