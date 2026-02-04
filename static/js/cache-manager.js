// Cache Manager - Client-side caching for API responses and data
(function () {
    'use strict';

    const CACHE_PREFIX = 'portfolio_cache_';
    const DEFAULT_TTL = 30 * 1000; // 30 seconds default
    const STALE_TTL = 5 * 60 * 1000; // 5 minutes for stale data

    // Cache configuration per endpoint
    const CACHE_CONFIG = {
        '/ticker': { ttl: 15000, staleTtl: 60000 },
        '/market-indices': { ttl: 15000, staleTtl: 60000 },
        '/historical-data': { ttl: 300000, staleTtl: 600000 }, // 5 min fresh, 10 min stale
    };

    // In-memory cache for ultra-fast access
    const memoryCache = new Map();

    // Get item from cache (memory first, then localStorage)
    function getCached(key) {
        const fullKey = CACHE_PREFIX + key;

        // Check memory cache first
        if (memoryCache.has(fullKey)) {
            return memoryCache.get(fullKey);
        }

        // Check localStorage
        try {
            const stored = localStorage.getItem(fullKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                memoryCache.set(fullKey, parsed);
                return parsed;
            }
        } catch (e) {
            console.warn('[CacheManager] Failed to read localStorage:', e);
        }

        return null;
    }

    // Store item in cache
    function setCache(key, data, config = {}) {
        const fullKey = CACHE_PREFIX + key;
        const ttl = config.ttl || DEFAULT_TTL;
        const staleTtl = config.staleTtl || STALE_TTL;

        const cacheEntry = {
            data,
            cachedAt: Date.now(),
            expiresAt: Date.now() + ttl,
            staleAt: Date.now() + staleTtl,
        };

        // Store in memory
        memoryCache.set(fullKey, cacheEntry);

        // Persist to localStorage
        try {
            localStorage.setItem(fullKey, JSON.stringify(cacheEntry));
        } catch (e) {
            console.warn('[CacheManager] Failed to write localStorage:', e);
            // Clear old cache entries if storage is full
            clearOldCache();
        }
    }

    // Check if cache entry is fresh
    function isFresh(entry) {
        return entry && Date.now() < entry.expiresAt;
    }

    // Check if cache entry is usable (not completely expired)
    function isUsable(entry) {
        return entry && Date.now() < entry.staleAt;
    }

    // Clear old cache entries
    function clearOldCache() {
        try {
            const keys = Object.keys(localStorage);
            const now = Date.now();

            keys.forEach((key) => {
                if (key.startsWith(CACHE_PREFIX)) {
                    try {
                        const entry = JSON.parse(localStorage.getItem(key));
                        if (entry && entry.staleAt < now) {
                            localStorage.removeItem(key);
                            memoryCache.delete(key);
                        }
                    } catch (e) {
                        localStorage.removeItem(key);
                    }
                }
            });
        } catch (e) {
            console.warn('[CacheManager] Failed to clear old cache:', e);
        }
    }

    // Enhanced fetch with caching
    async function cachedFetch(url, options = {}) {
        const cacheKey = url;
        const config = CACHE_CONFIG[url] || {};
        const cached = getCached(cacheKey);

        // If we have fresh cache, return immediately
        if (isFresh(cached)) {
            console.log('[CacheManager] Serving fresh cache for:', url);
            return { data: cached.data, fromCache: true, fresh: true };
        }

        // If we have usable stale cache, serve it immediately and refresh in background
        if (isUsable(cached)) {
            console.log('[CacheManager] Serving stale cache for:', url);

            // Refresh in background
            refreshInBackground(url, config);

            return { data: cached.data, fromCache: true, fresh: false };
        }

        // No cache, fetch from network
        try {
            const response = await fetch(url, {
                ...options,
                signal: options.signal || AbortSignal.timeout(10000),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setCache(cacheKey, data, config);

            return { data, fromCache: false, fresh: true };
        } catch (error) {
            console.warn('[CacheManager] Fetch failed:', error);

            // If we have any cached data, return it as fallback
            if (cached) {
                return { data: cached.data, fromCache: true, fresh: false, error };
            }

            throw error;
        }
    }

    // Background refresh without blocking
    function refreshInBackground(url, config) {
        // Use requestIdleCallback if available, otherwise setTimeout
        const scheduleRefresh = window.requestIdleCallback || ((cb) => setTimeout(cb, 100));

        scheduleRefresh(() => {
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    setCache(url, data, config);
                    console.log('[CacheManager] Background refresh complete for:', url);

                    // Dispatch event so UI can update if needed
                    window.dispatchEvent(new CustomEvent('cache-updated', { detail: { url, data } }));
                })
                .catch((error) => {
                    console.warn('[CacheManager] Background refresh failed:', error);
                });
        });
    }

    // Preload critical data
    function preloadData(urls) {
        urls.forEach((url) => {
            const config = CACHE_CONFIG[url] || {};
            const cached = getCached(url);

            if (!isFresh(cached)) {
                refreshInBackground(url, config);
            }
        });
    }

    // Clear all cache
    function clearAllCache() {
        memoryCache.clear();

        try {
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith(CACHE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn('[CacheManager] Failed to clear cache:', e);
        }
    }

    // Get cache statistics
    function getCacheStats() {
        const stats = {
            memoryEntries: memoryCache.size,
            localStorageEntries: 0,
            totalSize: 0,
        };

        try {
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith(CACHE_PREFIX)) {
                    stats.localStorageEntries++;
                    stats.totalSize += localStorage.getItem(key).length;
                }
            });
        } catch (e) {
            // Ignore
        }

        return stats;
    }

    // Initialize - clear old cache on load
    clearOldCache();

    // Export to global scope
    window.CacheManager = {
        cachedFetch,
        preloadData,
        clearAllCache,
        getCacheStats,
        setCache,
        getCached,
        isFresh,
        isUsable,
    };

})();
