// Minimal service worker: only makes the app installable and gives a graceful
// offline fallback for navigations. Deliberately does NOT cache API responses
// or authenticated page HTML — this app's data is all fetched client-side
// with a per-user Clerk token, and caching that at the SW layer risks
// serving one user's data to another after a session switch on a shared
// device. Static, same-origin assets (icons, manifest, Next's hashed JS/CSS
// bundles) are safe to cache since they're identical for everyone.
const CACHE_NAME = "resumeai-pro-shell-v1";
const PRECACHE_URLS = ["/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // never touch cross-origin (API) requests
  if (event.request.method !== "GET") return;

  // Full-page navigations: go to the network, fall back to a cached offline
  // shell if there's no connection. Never cache the navigation response
  // itself (it's per-user app content, not a static asset).
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")));
    return;
  }

  // Static, content-hashed Next.js assets and icons: cache-first, since the
  // filename changes whenever the content does.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
            return response;
          })
      )
    );
  }
});
