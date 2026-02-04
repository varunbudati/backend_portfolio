// Service Worker for Portfolio - Caching and Offline Support
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `portfolio-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `portfolio-dynamic-${CACHE_VERSION}`;
const API_CACHE = `portfolio-api-${CACHE_VERSION}`;

// Static assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/static/css/style.css',
  '/static/css/quant.css',
  '/static/js/script.js',
  '/static/js/quant.js',
  '/static/images/varun-budati.jpeg',
  '/static/images/logo.ico',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap',
  'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500&display=swap',
];

// API endpoints that can be cached with stale-while-revalidate
const API_ENDPOINTS = ['/ticker', '/market-indices'];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => console.warn('[SW] Failed to cache some assets:', err))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('portfolio-') && 
                     name !== STATIC_CACHE && 
                     name !== DYNAMIC_CACHE && 
                     name !== API_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, update in background
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with stale-while-revalidate
  if (API_ENDPOINTS.some((endpoint) => url.pathname === endpoint)) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE, 30000)); // 30 second max age
    return;
  }

  // Handle static assets with cache-first strategy
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE, 3000)); // 3 second timeout
    return;
  }

  // Default: network first with fallback to cache
  event.respondWith(networkFirst(request, DYNAMIC_CACHE, 5000));
});

// Cache-first strategy (for static assets)
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW] Fetch failed:', error);
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first strategy (for HTML pages)
async function networkFirst(request, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    // Return offline page or error
    return new Response(getOfflineHTML(), {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Stale-while-revalidate strategy (for API calls)
async function staleWhileRevalidate(request, cacheName, maxAgeMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  // Start fetching in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        // Store with timestamp
        const clone = response.clone();
        const headers = new Headers(clone.headers);
        headers.set('sw-cached-at', Date.now().toString());
        
        clone.text().then((body) => {
          const newResponse = new Response(body, {
            status: clone.status,
            statusText: clone.statusText,
            headers: headers
          });
          cache.put(request, newResponse);
        });
      }
      return response;
    })
    .catch((error) => {
      console.warn('[SW] API fetch failed:', error);
      return null;
    });
  
  // Return cached if fresh enough
  if (cached) {
    const cachedAt = parseInt(cached.headers.get('sw-cached-at') || '0', 10);
    const age = Date.now() - cachedAt;
    
    if (age < maxAgeMs) {
      // Cache is fresh, return immediately but still revalidate
      fetchPromise; // Fire and forget
      return cached;
    }
    
    // Cache is stale, try network first but fall back to cache
    const networkResponse = await Promise.race([
      fetchPromise,
      new Promise((resolve) => setTimeout(() => resolve(null), 2000))
    ]);
    
    return networkResponse || cached;
  }
  
  // No cache, wait for network
  const networkResponse = await fetchPromise;
  return networkResponse || new Response(JSON.stringify([]), {
    status: 503,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Check if URL is a static asset
function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some((ext) => url.pathname.endsWith(ext)) ||
         url.hostname.includes('fonts.googleapis.com') ||
         url.hostname.includes('fonts.gstatic.com');
}

// Offline HTML fallback
function getOfflineHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Varun Budati</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Poppins', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
    .offline-container {
      text-align: center;
      padding: 2rem;
    }
    .offline-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }
    h1 { margin-bottom: 0.5rem; }
    p { opacity: 0.8; margin-bottom: 1.5rem; }
    button {
      background: linear-gradient(135deg, #4fd1c5 0%, #38b2ac 100%);
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover { transform: scale(1.05); }
  </style>
</head>
<body>
  <div class="offline-container">
    <div class="offline-icon">📡</div>
    <h1>You're Offline</h1>
    <p>Please check your connection and try again.</p>
    <button onclick="location.reload()">Retry</button>
  </div>
</body>
</html>`;
}

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
});
