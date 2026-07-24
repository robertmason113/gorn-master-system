const APP_VERSION = '1.7.2';
const CACHE_NAME = `gorn-v${APP_VERSION}-stable`;
const APP_SHELL = [
  './',
  './index.html',
  './index.html?v=1.7.2',
  './style.css?v=1.7.2',
  './app.js?v=1.7.2',
  './data/cards.json?v=1.7.2',
  './manifest.webmanifest?v=1.7.2',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './vendor/jspdf.umd.min.js',
  './vendor/JSPDF_LICENSE.txt',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(
        APP_SHELL.map(async (url) => {
          try {
            const response = await fetch(url, { cache: 'reload' });
            if (response.ok) await cache.put(url, response.clone());
          } catch (_) {
            // One unavailable asset must not break the whole application update.
          }
        }),
      ),
    ),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches
        .keys()
        .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
    ]),
  );
});

async function networkFirst(request, fallback) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return (await caches.match(request)) || (fallback ? await caches.match(fallback) : null) || Response.error();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    fetch(request)
      .then((response) => {
        if (!response.ok) return;
        caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
      })
      .catch(() => {});
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith('/.netlify/functions/')) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, './index.html'));
    return;
  }

  if (url.pathname.endsWith('/data/cards.json')) {
    event.respondWith(networkFirst(request, './data/cards.json?v=1.7.2'));
    return;
  }

  event.respondWith(cacheFirst(request));
});
