/* global caches, self */

const cacheVersion = "territory-desk-shell-v2";
const scopeUrl = new URL(self.registration.scope);
const offlineUrl = new URL("offline-fallback.html", scopeUrl).href;
const applicationUrl = scopeUrl.href;
const staticDestinations = new Set(["font", "image", "script", "style"]);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(cacheVersion)
      .then((cache) => cache.addAll([applicationUrl, offlineUrl]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== cacheVersion)
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (
    request.method !== "GET" ||
    requestUrl.origin !== scopeUrl.origin ||
    requestUrl.pathname.includes("/api/")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone();
            void caches
              .open(cacheVersion)
              .then((cache) => cache.put(applicationUrl, responseCopy));
          }

          return response;
        })
        .catch(async () => {
          const cache = await caches.open(cacheVersion);
          return (
            (await cache.match(applicationUrl)) ??
            (await cache.match(offlineUrl))
          );
        }),
    );
    return;
  }

  if (staticDestinations.has(request.destination)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkResponse = fetch(request).then((response) => {
          if (response.ok) {
            const responseCopy = response.clone();
            void caches
              .open(cacheVersion)
              .then((cache) => cache.put(request, responseCopy));
          }

          return response;
        });

        return cachedResponse ?? networkResponse;
      }),
    );
  }
});
