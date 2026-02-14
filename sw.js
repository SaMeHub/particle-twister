/* particle-twister.mehlhase.info */
/* (c) Sascha Mehlhase - kontakt@mehlhase.info */
/* game idea: Sascha Mehlhase */
/* board design: Katarina Anthony and Sascha Mehlhase */
/* coding/PWA: Sascha Mehlhase */

// Files to cache
const cacheName = 'particle-twister-mehlhase-v2026-02-14a';
const appShellFiles = [
  '',
  './index.html',
  './app.js',
  './style.css',
  './favicon.ico',
  './media/icon-32.png',
  './media/icon-64.png',
  './media/icon-96.png',
  './media/icon-128.png',
  './media/icon-168.png',
  './media/icon-192.png',
  './media/icon-256.png',
  './media/icon-512.png',
  './media/header.png',
  './media/wheel.png',
  './media/card.png',
  './media/card_yellow.png',
  './media/card_red.png',
  './media/card_green.png',
  './data/wheel_card_data.json',
];
const contentToCache = appShellFiles;

// Installing Service Worker
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(contentToCache);
  })());
});

// Fetching content using Service Worker
self.addEventListener('fetch', (e) => {
    // Cache http and https only, skip unsupported chrome-extension:// and file://...
    if (!(
       e.request.url.startsWith('http:') || e.request.url.startsWith('https:')
    )) {
        return; 
    }

  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) return r;
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());
});
