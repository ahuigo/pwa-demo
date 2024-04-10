const version = 'v0.0.1';
const CACHE_NAME = '::static-cache';
const fallbackUrl = '/';
const urlsToCache = [fallbackUrl, 
    'images/icons/icon-128x128.png',
    '/images/icons/icon-168.png',
    '/script.js',
    '/style.css',
    '/manifest.json',
];

self.addEventListener('install', function (event) {
  // Skip over the "waiting" lifecycle state, to ensure that our
  // new service worker is activated immediately, even if there's
  // another tab open controlled by our older service worker code.
    self.skipWaiting();
    event.waitUntil(
        caches.open(version + CACHE_NAME)
            .then(function (cache) {
                return cache.addAll(urlsToCache);
            })
            .then(function () {
                console.log('WORKER: install completed');
            })
    );
});

// TODO: add button - clean cache and update app version
self.addEventListener('activate', event => {
    console.log('WORKER: activated');
    /*
    event.waitUntil(
        (async function () {
            // Feature-detect
            if (self.registration.navigationPreload) {
                // Enable navigation preloads!
                await self.registration.navigationPreload.enable();
            }
        })().then(
            caches.keys().then(function (cacheNames) {
                cacheNames.forEach(function (cacheName) {
                    if (cacheName !== version + CACHE_NAME) {
                        caches.delete(cacheName);
                        console.log(cacheName + ' CACHE deleted');
                    }
                });
            })
        )
    );
    */
});


self.addEventListener('fetch', event => {
    const { request } = event;

    if (!(event.request.url.indexOf('http') === 0)) return; // skip the chrome-extension:// 
    // Always bypass for range requests, due to browser bugs
    if (request.headers.has('range')) return;
    event.respondWith(
        (async function () {
            // Try to get from the cache:
            const cachedResponse = await caches.match(request);
            if (cachedResponse) return cachedResponse;

            try {
                const response = await event.preloadResponse;
                if (response) return response;

                // Otherwise, get from the network
                return await fetch(request);
            } catch (err) {
                // If this was a navigation, show the offline page:
                if (request.mode === 'navigate') {
                    console.log('Err: ', err);
                    console.log('Request: ', request);
                    return caches.match(fallbackUrl);
                }

                // Otherwise throw
                throw err;
            }
        })()
    );
});
