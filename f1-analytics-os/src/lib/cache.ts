// ============================================
// F1 ANALYTICS OS — HYBRID CACHE LAYER
// ============================================
// Two-tier caching: in-memory (fast) + Supabase (persistent).
// On Vercel cold start, data is recovered from Supabase.
// On warm request, served instantly from memory.

import { supabaseGet, supabaseSet, isSupabaseConfigured } from "./supabase";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached data or fetch fresh data if expired/missing.
 * Layer 1: In-memory → Layer 2: Supabase → Layer 3: Live fetch.
 */
export async function getOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL
): Promise<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  // Layer 1: Memory cache hit and still fresh
  if (entry && now - entry.timestamp < entry.ttl) {
    return entry.data;
  }

  // Layer 1b: Memory cache stale — return stale, refresh in background
  if (entry) {
    fetchFn()
      .then((data) => {
        store.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
        if (isSupabaseConfigured()) supabaseSet(key, data).catch(() => {});
      })
      .catch(() => {});
    return entry.data;
  }

  // Layer 2: Try Supabase persistent cache
  if (isSupabaseConfigured()) {
    try {
      const persisted = await supabaseGet<T>(key);
      if (persisted !== null) {
        store.set(key, { data: persisted, timestamp: now, ttl: ttlMs });
        // Background refresh from live source
        fetchFn()
          .then((data) => {
            store.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
            supabaseSet(key, data).catch(() => {});
          })
          .catch(() => {});
        return persisted;
      }
    } catch {
      // Supabase unavailable, continue to live fetch
    }
  }

  // Layer 3: Cache miss — live fetch
  try {
    const data = await fetchFn();
    store.set(key, { data, timestamp: now, ttl: ttlMs });
    if (isSupabaseConfigured()) supabaseSet(key, data).catch(() => {});
    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Directly set cache data (used by cron job).
 * Writes to both memory and Supabase.
 */
export async function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL): Promise<void> {
  store.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
  if (isSupabaseConfigured()) {
    await supabaseSet(key, data).catch(() => {});
  }
}

/**
 * Get cached data without fetching (returns undefined if miss).
 */
export function getCache<T>(key: string): T | undefined {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  return entry?.data;
}

/**
 * Invalidate all in-memory cached entries.
 */
export function invalidateAll(): void {
  store.clear();
}

/**
 * Get cache metadata for debugging.
 */
export function getCacheStats(): { keys: string[]; entries: number; lastUpdated: string | null; persistent: boolean } {
  const keys = Array.from(store.keys());
  let oldest = Infinity;
  for (const [, entry] of store) {
    if (entry.timestamp < oldest) oldest = entry.timestamp;
  }
  return {
    keys,
    entries: store.size,
    lastUpdated: store.size > 0 ? new Date(oldest).toISOString() : null,
    persistent: isSupabaseConfigured(),
  };
}
