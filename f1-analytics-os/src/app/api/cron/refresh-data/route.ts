// ============================================
// F1 ANALYTICS OS — DAILY CRON REFRESH
// ============================================
// Vercel Cron Job: runs daily at 05:00 UTC.
// Fetches all live data and populates the cache.

import { NextRequest, NextResponse } from "next/server";
import { setCache, invalidateAll } from "@/lib/cache";
import { fetchDriverStandings, fetchConstructorStandings, fetchRaceSchedule, fetchRaceResults, fetchNextRace } from "@/lib/services/f1-api";
import { fetchF1News } from "@/lib/services/news-api";
import {
  generateStrategicAlerts,
  generateSponsorEstimates,
  generateSocialEstimates,
  generateMerchEstimates,
  generateKPIs,
  generateTickerHeadlines,
} from "@/lib/services/ai-insights";

export const maxDuration = 60; // Allow up to 60s for all fetches

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i))); // Exponential backoff
    }
  }
  throw new Error("Unreachable");
}

export async function GET(request: NextRequest) {
  // Security: verify cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // Allow unauthenticated in development, require auth in production
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const log: string[] = [];
  const errors: string[] = [];

  try {
    // Clear stale cache
    invalidateAll();
    log.push("Cache invalidated");

    // ---- Step 1: Fetch raw F1 data (real) ----
    let drivers, constructors, schedule, results, nextRace;

    try {
      [drivers, constructors, schedule, results, nextRace] = await Promise.all([
        withRetry(fetchDriverStandings),
        withRetry(fetchConstructorStandings),
        withRetry(fetchRaceSchedule),
        withRetry(fetchRaceResults),
        withRetry(fetchNextRace),
      ]);
      log.push(`F1 data: ${drivers.length} drivers, ${constructors.length} constructors, ${schedule.length} races, ${results.length} results`);
    } catch (err) {
      errors.push(`F1 API failed: ${err}`);
      return NextResponse.json({ success: false, errors, elapsed: Date.now() - startTime }, { status: 500 });
    }

    // Cache raw standings
    setCache("standings:drivers", drivers);
    setCache("standings:constructors", constructors);
    setCache("schedule", schedule);
    setCache("results", results);
    setCache("nextRace", nextRace);

    // ---- Step 2: Fetch news ----
    let news: Awaited<ReturnType<typeof fetchF1News>> = [];
    try {
      news = await withRetry(() => fetchF1News(10));
      log.push(`News: ${news.length} articles`);
    } catch (err) {
      errors.push(`News API failed: ${err}`);
      news = [];
    }
    setCache("news", news);

    // ---- Step 3: Generate AI-computed data ----
    const sponsors = generateSponsorEstimates(constructors);
    setCache("sponsors", sponsors);
    log.push(`Sponsors: ${sponsors.length} generated`);

    const social = generateSocialEstimates(constructors);
    setCache("fans", social);
    log.push(`Social: ${social.length} teams`);

    const merch = generateMerchEstimates(constructors);
    setCache("merch", merch);
    log.push(`Merch: ${merch.length} products`);

    const kpis = generateKPIs(constructors, sponsors, social, merch);
    setCache("kpis", kpis);
    log.push(`KPIs: ${kpis.length} metrics`);

    const ticker = generateTickerHeadlines(constructors, drivers, nextRace, news);
    setCache("ticker", ticker);
    log.push(`Ticker: ${ticker.length} headlines`);

    // ---- Step 4: Generate AI strategic alerts ----
    let alerts: Awaited<ReturnType<typeof generateStrategicAlerts>> = [];
    try {
      alerts = await withRetry(() => generateStrategicAlerts(constructors, drivers, results, news));
      log.push(`Alerts: ${alerts.length} generated via AI`);
    } catch (err) {
      errors.push(`AI alerts failed: ${err}`);
      alerts = [];
    }
    setCache("alerts", alerts);

    const elapsed = Date.now() - startTime;
    log.push(`Completed in ${elapsed}ms`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      elapsed,
      log,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err), elapsed: Date.now() - startTime },
      { status: 500 }
    );
  }
}
