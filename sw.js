// Lets the Low helper open with no connection. Other pages are left alone.
const CACHE = "low-helper-v1";
const SHELL = ["low-helper.html", "low-helper.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("low-helper-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Fonts: use the saved copy first, since they never change
  if (FONT_HOSTS.includes(url.hostname)) {
    event.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(req).then(hit => hit || fetch(req).then(res => { cache.put(req, res.clone()); return res; }))
      )
    );
    return;
  }

  // The helper's own files: try the network for the latest, fall back to the saved copy
  const file = url.pathname.split("/").pop();
  if (url.origin === location.origin && SHELL.includes(file)) {
    event.respondWith(
      fetch(req)
        .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(file, copy)); return res; })
        .catch(() => caches.match(file))
    );
  }
});
