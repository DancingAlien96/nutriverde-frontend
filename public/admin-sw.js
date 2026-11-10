/* Service worker del panel de administración (scope: /admin/).
 *
 * Estrategia deliberadamente simple:
 * - Navegaciones (HTML): red primero; si no hay conexión, la última copia
 *   de esa página o la página /admin/offline.
 * - Estáticos de Next (/_next/static/) e iconos: caché primero (tienen hash,
 *   nunca cambian).
 * - Cualquier otra cosa, incluida la API (otro origen), va siempre a la red
 *   y no se guarda: los datos del panel no deben quedar en caché.
 * - Notificaciones push: el servidor manda { title, body, url, tag }; al
 *   tocarla se enfoca la pestaña del panel si ya está abierta o se abre.
 */
const VERSION = "admin-v2";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const OFFLINE_URL = "/admin/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: "reload" })))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("admin-") && !k.startsWith(VERSION))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // API y terceros: red directa

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request));
  }
});

async function networkFirstPage(request) {
  const cache = await caches.open(PAGES_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || (await cache.match(OFFLINE_URL)) || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  const title = data.title || "Plenha Nutrition";
  const url = data.url || "/admin/citas";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icons/admin-192.png",
      badge: "/icons/admin-192.png",
      tag: data.tag || undefined,
      renotify: !!data.tag,
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "/admin/citas", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const panel = clients.find((c) => c.url.includes("/admin"));
      if (panel) {
        return panel.focus().then((c) => (c && "navigate" in c ? c.navigate(target) : c));
      }
      return self.clients.openWindow(target);
    }),
  );
});
