// In-memory client-side cache for instant route navigation
const cache = new Map();

/**
 * Retrieve cached data if not expired
 * @param {string} key 
 * @returns {any|null}
 */
export const getCached = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.data;
};

/**
 * Store data in client cache with TTL (default 60s)
 * @param {string} key 
 * @param {any} data 
 * @param {number} ttlMs 
 */
export const setCached = (key, data, ttlMs = 60000) => {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
};

/**
 * Invalidate cache by prefix or clear all
 * @param {string} [prefix] 
 */
export const invalidateCache = (prefix = '') => {
  if (!prefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) {
      cache.delete(key);
    }
  }
};

export default {
  getCached,
  setCached,
  invalidateCache,
};
