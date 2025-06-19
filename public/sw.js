// const CACHE_NAME = 'podravka-cache-v1';
// const API_CACHE_NAME = 'podravka-api-cache-v1';
// const STATIC_ASSETS = [
//   '/',
//   '/index.html',
//   '/manifest.json',
//   '/icons/icon-192x192.png',
//   '/icons/icon-512x512.png'
// ];

// // API endpoints to cache
// const API_ENDPOINTS = {
//   STORES_BY_USER: '/api/stores/user/',
//   STORE_BY_ID: '/api/stores/',
//   PRODUCTS_BY_STORE: '/api/products/store/',
//   COMPETITOR_BY_CATEGORY: '/api/competitors/category/'
// };

// // Cache expiration times (in milliseconds)
// const CACHE_EXPIRATION = {
//   STORE: 24 * 60 * 60 * 1000, // 24 hours
//   PRODUCTS: 12 * 60 * 60 * 1000, // 12 hours
//   COMPETITORS: 12 * 60 * 60 * 1000 // 12 hours
// };

// // Install event - cache static assets
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     Promise.all([
//       caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
//       caches.open(API_CACHE_NAME)
//     ])
//   );
// });

// // Activate event - clean up old caches
// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames
//           .filter((name) => name !== CACHE_NAME && name !== API_CACHE_NAME)
//           .map((name) => caches.delete(name))
//       );
//     })
//   );
// });

// // Helper function to check if a request is for one of our API endpoints
// const isApiRequest = (url) => {
//   return Object.values(API_ENDPOINTS).some(endpoint => url.includes(endpoint));
// };

// // Helper function to check if we're online
// const isOnline = () => {
//   return navigator.onLine;
// };

// // Helper function to get cache expiration time for an endpoint
// const getCacheExpiration = (url) => {
//   if (url.includes(API_ENDPOINTS.STORE_BY_ID)) {
//     return CACHE_EXPIRATION.STORE;
//   }
//   if (url.includes(API_ENDPOINTS.PRODUCTS_BY_STORE)) {
//     return CACHE_EXPIRATION.PRODUCTS;
//   }
//   if (url.includes(API_ENDPOINTS.COMPETITOR_BY_CATEGORY)) {
//     return CACHE_EXPIRATION.COMPETITORS;
//   }
//   return CACHE_EXPIRATION.STORE; // default
// };

// // Helper function to check if cache is expired
// const isCacheExpired = (cacheTime) => {
//   return Date.now() - cacheTime > CACHE_EXPIRATION.STORE;
// };

// // Helper function to add cache metadata
// const addCacheMetadata = (response) => {
//   const metadata = {
//     timestamp: Date.now()
//   };
//   return new Response(response.body, {
//     status: response.status,
//     statusText: response.statusText,
//     headers: {
//       ...Object.fromEntries(response.headers),
//       'x-cache-timestamp': metadata.timestamp.toString()
//     }
//   });
// };

// // Helper function to get cache metadata
// const getCacheMetadata = (response) => {
//   const timestamp = response.headers.get('x-cache-timestamp');
//   return timestamp ? parseInt(timestamp, 10) : null;
// };

// // Fetch event - handle network requests
// self.addEventListener('fetch', (event) => {
//   const request = event.request;
//   const url = new URL(request.url);

//   // Handle API requests
//   if (isApiRequest(url.pathname)) {
//     event.respondWith(
//       (async () => {
//         // Try to get from cache first
//         const cachedResponse = await caches.match(request);
        
//         if (cachedResponse) {
//           const cacheTime = getCacheMetadata(cachedResponse);
//           const isExpired = cacheTime && isCacheExpired(cacheTime);

//           // If cache is expired and we're online, fetch fresh data
//           if (isExpired && isOnline()) {
//             try {
//               const freshResponse = await fetch(request);
//               if (freshResponse.ok) {
//                 const responseToCache = addCacheMetadata(freshResponse.clone());
//                 caches.open(API_CACHE_NAME).then(cache => {
//                   cache.put(request, responseToCache);
//                 });
//                 return freshResponse;
//               }
//             } catch (error) {
//               console.error('Failed to fetch fresh data:', error);
//               // If fetch fails, return cached data even if expired
//               return cachedResponse;
//             }
//           }

//           // If we're online, update cache in background
//           if (isOnline()) {
//             fetch(request)
//               .then(response => {
//                 if (response.ok) {
//                   const responseToCache = addCacheMetadata(response.clone());
//                   caches.open(API_CACHE_NAME).then(cache => {
//                     cache.put(request, responseToCache);
//                   });
//                 }
//               })
//               .catch(() => {
//                 console.log('Failed to update cache');
//               });
//           }
//           return cachedResponse;
//         }

//         // If not in cache and we're online, fetch from network
//         if (isOnline()) {
//           try {
//             const response = await fetch(request);
//             if (response.ok) {
//               const responseToCache = addCacheMetadata(response.clone());
//               caches.open(API_CACHE_NAME).then(cache => {
//                 cache.put(request, responseToCache);
//               });
//             }
//             return response;
//           } catch (error) {
//             console.error('Fetch failed:', error);
//             return new Response(JSON.stringify({ error: 'Network error' }), {
//               status: 503,
//               headers: { 'Content-Type': 'application/json' }
//             });
//           }
//         }

//         // If offline and not in cache, return error
//         return new Response(JSON.stringify({ error: 'Offline' }), {
//           status: 503,
//           headers: { 'Content-Type': 'application/json' }
//         });
//       })()
//     );
//     return;
//   }

//   // Handle static assets
//   event.respondWith(
//     caches.match(request)
//       .then((response) => {
//         if (response) {
//           return response;
//         }

//         return fetch(request).then(
//           (response) => {
//             if (!response || response.status !== 200 || response.type !== 'basic') {
//               return response;
//             }

//             const responseToCache = response.clone();
//             caches.open(CACHE_NAME).then((cache) => {
//               cache.put(request, responseToCache);
//             });

//             return response;
//           }
//         );
//       })
//   );
// }); 