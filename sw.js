/* ============================================================
   Vision of the Heavens — Service Worker
   ------------------------------------------------------------
   IMPORTANT: bump APP_VERSION on every commit you want pushed
   to installed apps. The cache name is tied to this version, so
   a new version creates a fresh cache and retires the old one.
   ============================================================ */
const APP_VERSION = "2026-06-13-11";
const CACHE = "voth-" + APP_VERSION;

/* Core files that make the app shell work offline */
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* ---- Install: pre-cache the shell (resilient — one missing file won't abort the install) ---- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(CORE.map((url) =>
        cache.add(url).catch(() => { /* ignore a single failed file */ })
      ))
    )
  );
  /* do NOT skipWaiting here — we wait for the user's "Update" tap (see message handler) */
});

/* ---- Activate: clean up old version caches ---- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("voth-") && k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ---- The page asks us to activate the new version now ---- */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

/* ---- Helpers ---- */
function isFont(url) {
  return url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
}
function isBibleApi(url) {
  return (
    url.hostname === "api.getbible.net" ||
    url.hostname === "bible-api.com" ||
    url.hostname === "cdn.jsdelivr.net"
  );
}

/* ---- Fetch routing ---- */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; /* Cache API only handles GET */

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  /* Navigations / the HTML document: NETWORK-FIRST so a new deploy always wins online,
     fall back to the cached shell when offline. */
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          /* only cache a genuinely good page */
          if (res && res.ok && res.status === 200 && res.type !== "opaqueredirect") {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put("./index.html", copy)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match("./index.html").then((r) => r || caches.match("./") )
            .then((r) => r || fetch("./index.html"))
        )
    );
    return;
  }

  /* Fonts: CACHE-FIRST (they never change) */
  if (isFont(url)) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => cached)
      )
    );
    return;
  }

  /* Bible text API + jsdelivr: STALE-WHILE-REVALIDATE
     (instant from cache, quietly refreshed; once read, a chapter works offline forever) */
  if (isBibleApi(url)) {
    event.respondWith(
      caches.open(CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          const network = fetch(req)
            .then((res) => { cache.put(req, res.clone()).catch(() => {}); return res; })
            .catch(() => cached);
          return cached || network;
        })
      )
    );
    return;
  }

  /* Same-origin static assets (icons etc.): CACHE-FIRST */
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        }).catch(() => cached)
      )
    );
  }
});
