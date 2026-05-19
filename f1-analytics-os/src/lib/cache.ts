// ============================================
// F1 ANALYTICS OS — EDGE-COMPATIBLE CACHE
// ============================================
// In-memory cache with TTL. On Vercel, this persists within
// a single serverless cold start (~5-15 min). The cron job
// refreshes daily, and stale data is served while revalidating.

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const store = new Map<string, CacheEntry<unknown>>();

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached data or fetch fresh data if expired/missing.
 * Implements stale-while-revalidate: returns stale data immediately
 * while triggering a background refresh.
 */
export async function getOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL
): Promise<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  // Cache hit and still fresh
  if (entry && now - entry.timestamp < entry.ttl) {
    return entry.data;
  }

  // Cache hit but stale — return stale, refresh in background
  if (entry) {
    // Fire and forget background refresh
    fetchFn()
      .then((data) => {
        store.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
      })
      .catch(() => {
        // Keep stale data on failure
      });
    return entry.data;
  }

  // Cache miss — must fetch
  try {
    const data = await fetchFn();
    store.set(key, { data, timestamp: now, ttl: ttlMs });
    return data;
  } catch (error) {
    throw error; // Caller handles fallback
  }
}

/**
 * Directly set cache data (used by cron job).
 */
export function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL): void {
  store.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

/**
 * Get cached data without fetching (returns undefined if miss).
 */
export function getCache<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  return entry?.data;
}

/**
 * Invalidate all cached entries (forces fresh fetches).
 */
export function invalidateAll(): void {
  store.clear();
}

/**
 * Get cache metadata for debugging.
 */
export function getCacheStats(): { keys: string[]; entries: number; lastUpdated: string | null } {
  const keys = Array.from(store.keys());
  let oldest = Infinity;
  for (const [, entry] of store) {
    if (entry.timestamp < oldest) oldest = entry.timestamp;
  }
  return {
    keys,
    entries: store.size,
    lastUpdated: store.size > 0 ? new Date(oldest).toISOString() : null,
  };
}
