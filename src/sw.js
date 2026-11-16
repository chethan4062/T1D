// Lets the Low helper open with no connection. Other pages are left alone.
const CACHE = "low-helper-v4";
// Paths are relative to this file
const SHELL = [
  "tools/low-helper/", "low-helper.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png",
  "assets/css/base.css", "assets/css/low-helper.css", "assets/js/low-helper.js",
  "about/disclaimer/", "assets/css/article.css", "assets/js/site.js",
  // the helper's old address, which forwards to the new one
  "low-helper.html"
];
const ROOT = new URL("./", self.location).pathname;
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

  // The helper's own files: answer from the saved copy at once, so a weak signal never
  // holds it up, and fetch the latest in the background for next time
  const file = url.pathname.startsWith(ROOT) ? url.pathname.slice(ROOT.length) : null;
  if (url.origin === location.origin && SHELL.includes(file)) {
    event.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(file).then(hit => {
          const fresh = fetch(req)
            .then(res => { if (res.ok) cache.put(file, res.clone()); return res; })
            .catch(() => hit);
          if (hit) event.waitUntil(fresh);
          return hit || fresh;
        })
      )
    );
  }
});
