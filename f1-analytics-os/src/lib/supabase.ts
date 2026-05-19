// ============================================
// F1 ANALYTICS OS — SUPABASE PERSISTENT CACHE
// ============================================
// Provides persistent storage via Supabase REST API.
// Data survives Vercel cold starts. Falls back to in-memory.
//
// SETUP: Run this SQL in Supabase SQL Editor:
// CREATE TABLE IF NOT EXISTS f1_cache (
//   key TEXT PRIMARY KEY,
//   value JSONB NOT NULL,
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE f1_cache ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Allow anon access" ON f1_cache FOR ALL USING (true);

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "";

const headers = () => ({
  "apikey": SUPABASE_KEY,
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "resolution=merge-duplicates",
});

function isConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_KEY);
}

export async function supabaseGet<T>(key: string): Promise<T | null> {
  if (!isConfigured()) return null;
  try {
    const res = await fetch(
      `${SUPABASE_URL}/f1_cache?key=eq.${encodeURIComponent(key)}&select=value,updated_at`,
      { headers: headers(), next: { revalidate: 0 } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows || rows.length === 0) return null;
    return rows[0].value as T;
  } catch {
    return null;
  }
}

export async function supabaseSet<T>(key: string, value: T): Promise<boolean> {
  if (!isConfigured()) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/f1_cache`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        key,
        value,
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function supabaseGetAll(): Promise<Record<string, unknown>> {
  if (!isConfigured()) return {};
  try {
    const res = await fetch(
      `${SUPABASE_URL}/f1_cache?select=key,value`,
      { headers: headers(), next: { revalidate: 0 } }
    );
    if (!res.ok) return {};
    const rows = await res.json();
    const result: Record<string, unknown> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const row of (rows || []) as any[]) {
      result[row.key] = row.value;
    }
    return result;
  } catch {
    return {};
  }
}

export { isConfigured as isSupabaseConfigured };
