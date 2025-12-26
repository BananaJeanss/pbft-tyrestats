const CACHE_NAME = "tyrestats-offline-v1";
const OFFLINE_URL = "/offline";

const ESSENTIAL_ASSETS = [OFFLINE_URL, "/icon-192x192.png", "/tslogow.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache the essential list of assets
      await cache.addAll(
        ESSENTIAL_ASSETS.map((url) => new Request(url, { cache: "reload" })),
      );
    })(),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        }),
      );
    })(),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const requestUrl = new URL(event.request.url);

  // 2. Handle Navigation Requests (HTML pages, like before)
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;

          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // Fallback to offline page for navigation failure
          console.warn(
            `Navigation failed; returning offline page instead. ${error}`,
          );
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })(),
    );
    return;
  }

  // Check if it's an essential asset OR a next.js asset
  const isEssential = ESSENTIAL_ASSETS.includes(requestUrl.pathname);
  const isNextAsset =
    requestUrl.pathname.startsWith("/_next/") ||
    requestUrl.pathname.startsWith("/icon-");

  if (isEssential || isNextAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // Return from cache if found
        if (cachedResponse) return cachedResponse;

        // Otherwise, fetch from network and cache for next time
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch(() => {
            // womp womp
          });
      }),
    );
  }
});
