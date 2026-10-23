/* Service Worker: prioriza la versión publicada en GitHub Pages */

const VERSION = "average-roguelike-v1.3.7";
const CACHE = VERSION;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // No interceptar peticiones a otros dominios.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();

          event.waitUntil(
            caches.open(CACHE)
              .then((cache) => cache.put(request, copy))
              .catch(() => {})
          );
        }

        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);

        if (cached) return cached;

        // Mostrar la página guardada si se navega sin conexión.
        if (request.mode === "navigate") {
          const page = await caches.match("./index.html");
          if (page) return page;
        }

        return new Response("Sin conexión y sin copia guardada.", {
          status: 503,
          headers: { "Content-Type": "text/plain; charset=utf-8" }
        });
      })
  );
});
