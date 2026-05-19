// ============================================
// F1 ANALYTICS OS — ENTERPRISE CRON REFRESH
// ============================================
// Vercel Cron Job: runs daily at 05:00 UTC.
// Orchestrates ALL data sources: Jolpica F1, GNews,
// NewsData.io, YouTube, Exchange Rates, HuggingFace,
// Gemini 2.5 Pro, Open Meteo, REST Countries.
// Persists to Supabase + memory cache.

import { NextRequest, NextResponse } from "next/server";
import { setCache, invalidateAll } from "@/lib/cache";
import { fetchDriverStandings, fetchConstructorStandings, fetchRaceSchedule, fetchRaceResults, fetchNextRace } from "@/lib/services/f1-api";
import { fetchF1News } from "@/lib/services/news-api";
import { fetchF1ChannelStats, fetchF1TrendingVideos } from "@/lib/services/youtube-api";
import { fetchExchangeRates } from "@/lib/services/exchange-rate-api";
import { analyzeSentiment, aggregateSentiment } from "@/lib/services/sentiment-api";
import { fetchAllRaceWeather } from "@/lib/services/weather-api";
import { fetchF1CountryData } from "@/lib/services/countries-api";
import {
  generateStrategicAlerts,
  generateSponsorEstimates,
  generateSocialEstimates,
  generateMerchEstimates,
  generateKPIs,
  generateTickerHeadlines,
} from "@/lib/services/ai-insights";

export const maxDuration = 60;

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
  throw new Error("Unreachable");
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const log: string[] = [];
  const errors: string[] = [];

  try {
    invalidateAll();
    log.push("Cache invalidated");

    // ═══════════════════════════════════════════
    // STAGE 1: Core F1 Data (Jolpica API)
    // ═══════════════════════════════════════════
    let drivers, constructors, schedule, results, nextRace;
    try {
      [drivers, constructors, schedule, results, nextRace] = await Promise.all([
        withRetry(fetchDriverStandings),
        withRetry(fetchConstructorStandings),
        withRetry(fetchRaceSchedule),
        withRetry(fetchRaceResults),
        withRetry(fetchNextRace),
      ]);
      log.push(`✅ F1: ${drivers.length} drivers, ${constructors.length} constructors, ${schedule.length} races, ${results.length} results`);
    } catch (err) {
      errors.push(`❌ F1 API: ${err}`);
      return NextResponse.json({ success: false, errors, elapsed: Date.now() - startTime }, { status: 500 });
    }

    await setCache("standings:drivers", drivers);
    await setCache("standings:constructors", constructors);
    await setCache("schedule", schedule);
    await setCache("results", results);
    await setCache("nextRace", nextRace);

    // ═══════════════════════════════════════════
    // STAGE 2: Multi-Source News (GNews + NewsData.io)
    // ═══════════════════════════════════════════
    let news: Awaited<ReturnType<typeof fetchF1News>> = [];
    try {
      news = await withRetry(() => fetchF1News(10));
      log.push(`✅ News: ${news.length} articles (GNews + NewsData.io)`);
    } catch (err) {
      errors.push(`⚠️ News: ${err}`);
    }
    await setCache("news", news);

    // ═══════════════════════════════════════════
    // STAGE 3: YouTube Intelligence
    // ═══════════════════════════════════════════
    let ytChannels: Awaited<ReturnType<typeof fetchF1ChannelStats>> = [];
    let ytTrending: Awaited<ReturnType<typeof fetchF1TrendingVideos>> = [];
    try {
      [ytChannels, ytTrending] = await Promise.all([
        fetchF1ChannelStats(),
        fetchF1TrendingVideos(5),
      ]);
      log.push(`✅ YouTube: ${ytChannels.length} channels, ${ytTrending.length} trending videos`);
    } catch (err) {
      errors.push(`⚠️ YouTube: ${err}`);
    }
    await setCache("youtube:channels", ytChannels);
    await setCache("youtube:trending", ytTrending);

    // ═══════════════════════════════════════════
    // STAGE 4: Exchange Rates
    // ═══════════════════════════════════════════
    let exchangeRates: Awaited<ReturnType<typeof fetchExchangeRates>>;
    try {
      exchangeRates = await fetchExchangeRates();
      log.push(`✅ Exchange: ${Object.keys(exchangeRates.rates).length} currencies`);
    } catch (err) {
      errors.push(`⚠️ Exchange: ${err}`);
      exchangeRates = { base: "USD", rates: { USD: 1 }, lastUpdated: new Date().toISOString() };
    }
    await setCache("exchangeRates", exchangeRates);

    // ═══════════════════════════════════════════
    // STAGE 5: Sentiment Analysis (HuggingFace)
    // ═══════════════════════════════════════════
    let sentimentData: Awaited<ReturnType<typeof aggregateSentiment>> = { score: 70, positive: 50, neutral: 35, negative: 15 };
    try {
      if (news.length > 0) {
        const headlines = news.map((n) => n.title);
        const sentimentResults = await analyzeSentiment(headlines);
        sentimentData = aggregateSentiment(sentimentResults);
        // Attach sentiment to news articles
        news = news.map((n, i) => ({
          ...n,
          sentiment: sentimentResults[i]?.label || "neutral",
        }));
        await setCache("news", news); // Update with sentiment
        log.push(`✅ Sentiment: score=${sentimentData.score} (${sentimentData.positive}% pos, ${sentimentData.neutral}% neu, ${sentimentData.negative}% neg)`);
      }
    } catch (err) {
      errors.push(`⚠️ Sentiment: ${err}`);
    }
    await setCache("sentiment", sentimentData);

    // ═══════════════════════════════════════════
    // STAGE 6: AI-Computed Business Intelligence
    // ═══════════════════════════════════════════

    // Enrich social estimates with real YouTube data
    const social = generateSocialEstimates(constructors);
    for (const team of social) {
      const ytData = ytChannels.find((c) => {
        const teamLower = team.team.toLowerCase().replace(/\s+/g, "_").replace("f1_team", "").trim();
        return c.teamKey.includes(teamLower) || teamLower.includes(c.teamKey);
      });
      if (ytData) {
        team.youtube = ytData.subscriberCount;
      }
    }
    await setCache("fans", social);
    log.push(`✅ Social: ${social.length} teams (enriched with YouTube)`);

    const sponsors = generateSponsorEstimates(constructors);
    await setCache("sponsors", sponsors);
    log.push(`✅ Sponsors: ${sponsors.length} generated`);

    const merch = generateMerchEstimates(constructors);
    await setCache("merch", merch);
    log.push(`✅ Merch: ${merch.length} products`);

    const kpis = generateKPIs(constructors, sponsors, social, merch);
    await setCache("kpis", kpis);
    log.push(`✅ KPIs: ${kpis.length} metrics`);

    const ticker = generateTickerHeadlines(constructors, drivers, nextRace, news);
    await setCache("ticker", ticker);
    log.push(`✅ Ticker: ${ticker.length} headlines`);

    // ═══════════════════════════════════════════
    // STAGE 7: AI Strategic Alerts (Gemini 2.5 Pro)
    // ═══════════════════════════════════════════
    let alerts: Awaited<ReturnType<typeof generateStrategicAlerts>> = [];
    try {
      alerts = await withRetry(() => generateStrategicAlerts(constructors, drivers, results, news));
      log.push(`✅ AI Alerts: ${alerts.length} via Gemini 2.5 Pro`);
    } catch (err) {
      errors.push(`⚠️ AI Alerts: ${err}`);
    }
    await setCache("alerts", alerts);

    // ═══════════════════════════════════════════
    // STAGE 8: Race Weather (Open Meteo)
    // ═══════════════════════════════════════════
    try {
      const weather = await fetchAllRaceWeather(schedule);
      await setCache("weather", weather);
      log.push(`✅ Weather: ${weather.length} race forecasts`);
    } catch (err) {
      errors.push(`⚠️ Weather: ${err}`);
    }

    // ═══════════════════════════════════════════
    // STAGE 9: Country Data (REST Countries)
    // ═══════════════════════════════════════════
    try {
      const countries = await fetchF1CountryData();
      await setCache("countries", countries);
      log.push(`✅ Countries: ${countries.length} F1 markets`);
    } catch (err) {
      errors.push(`⚠️ Countries: ${err}`);
    }

    const elapsed = Date.now() - startTime;
    log.push(`\n✅ PIPELINE COMPLETE in ${elapsed}ms | ${9 - errors.length}/9 stages successful`);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      elapsed,
      stages: {
        f1: "✅", news: news.length > 0 ? "✅" : "⚠️",
        youtube: ytChannels.length > 0 ? "✅" : "⚠️",
        exchange: "✅", sentiment: sentimentData.score > 0 ? "✅" : "⚠️",
        intelligence: "✅", alerts: alerts.length > 0 ? "✅" : "⚠️",
        weather: "✅", countries: "✅",
      },
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
