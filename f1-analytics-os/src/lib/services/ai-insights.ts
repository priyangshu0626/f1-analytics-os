// ============================================
// F1 ANALYTICS OS — AI INTERPRETATION LAYER
// ============================================
// Gemini 2.5 Pro is ONLY used for:
// ✅ Summarizing real data
// ✅ Explaining trends
// ✅ Identifying anomalies
// ✅ Strategic recommendations
// ✅ Interpreting analytics
//
// Gemini is NEVER used for:
// ❌ Fabricating statistics
// ❌ Inventing engagement metrics
// ❌ Generating fake financials
// ❌ Creating fictional data

import type { ConstructorStanding, DriverStanding, RaceResult } from "./f1-api";
import type { NewsArticle } from "./news-api";
import type { AIInsight } from "../data";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent";

// ============================================
// MANDATORY AI SAFETY PROMPT PREFIX
// ============================================

const AI_SAFETY_PREFIX = `CRITICAL INSTRUCTION: Never fabricate or estimate statistics, telemetry, standings, sponsorship values, engagement metrics, or financial figures. Only analyze the structured real-world data provided in the input. If sufficient data is unavailable, explicitly state that the available dataset is limited. All numbers you reference MUST come from the data provided below.\n\n`;

// ---- Gemini Helper ----

async function askGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) return "";
  try {
    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: AI_SAFETY_PREFIX + prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch {
    return "";
  }
}

// ============================================
// STRATEGIC ALERTS (AI Interpretation Only)
// ============================================

export async function generateStrategicAlerts(
  constructors: ConstructorStanding[],
  drivers: DriverStanding[],
  results: RaceResult[],
  news: NewsArticle[],
): Promise<AIInsight[]> {
  const standingsContext = constructors
    .map((c) => `${c.constructorName}: P${c.position} (${c.points}pts, ${c.wins}W)`)
    .join(", ");
  const driversContext = drivers
    .slice(0, 10)
    .map((d) => `${d.givenName} ${d.familyName} (${d.constructorName}): P${d.position} ${d.points}pts`)
    .join(", ");
  const lastRace = results.length > 0 ? results[results.length - 1] : null;
  const lastRaceContext = lastRace
    ? `Last race: ${lastRace.raceName} — Winner: ${lastRace.results[0]?.driverName || "N/A"} (${lastRace.results[0]?.constructorName || "N/A"})`
    : "Season in progress";
  const newsContext = news
    .slice(0, 5)
    .map((n) => n.title)
    .join("; ");

  const prompt = `You are an F1 commercial intelligence analyst. Based on the REAL 2026 F1 data provided below, generate exactly 5 strategic business alerts.

REAL 2026 DATA:
- CONSTRUCTOR STANDINGS: ${standingsContext}
- DRIVER STANDINGS (top 10): ${driversContext}
- ${lastRaceContext}
- RECENT HEADLINES: ${newsContext}

RULES:
- Only reference the ACTUAL data provided above
- Do NOT invent any numbers not present in the data
- Focus on patterns visible in the standings (who is leading, gaps between teams, win distribution)
- Provide actionable business insights about what these REAL standings mean commercially

Return ONLY a JSON array. Each alert:
- id: string (a1-a5)
- type: "opportunity" | "anomaly" | "risk" | "growth" | "prediction"
- severity: "high" | "medium" | "low"
- title: string (short, executive-level)
- summary: string (1-2 sentences referencing ONLY the real data provided)
- module: "commercial" | "fans" | "markets" | "simulator"
- timestamp: relative time like "2 hours ago"`;

  const raw = await askGemini(prompt);
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {}

  // Deterministic fallback from REAL data
  return generateFallbackAlerts(constructors, drivers);
}

function generateFallbackAlerts(
  constructors: ConstructorStanding[],
  drivers: DriverStanding[],
): AIInsight[] {
  const leader = constructors[0];
  const topDriver = drivers[0];

  return [
    {
      id: "a1",
      type: "growth",
      severity: "high",
      title: `${leader?.constructorName || "—"} Leads Constructor Championship`,
      summary: `${leader?.constructorName} is P1 with ${leader?.points}pts and ${leader?.wins} wins after ${constructors.length > 0 ? "round " + constructors.length : "early"} races. This is factual standings data from Jolpica F1 API.`,
      module: "commercial",
      timestamp: "Updated with latest standings",
    },
    {
      id: "a2",
      type: "opportunity",
      severity: "medium",
      title: `${topDriver?.givenName} ${topDriver?.familyName} — Championship Leader`,
      summary: `${topDriver?.givenName} ${topDriver?.familyName} leads the drivers' championship with ${topDriver?.points}pts for ${topDriver?.constructorName}. Data source: Jolpica F1 API.`,
      module: "fans",
      timestamp: "Updated with latest standings",
    },
    {
      id: "a3",
      type: "anomaly",
      severity: "low",
      title: "Points Gap Analysis",
      summary: `Gap between P1 (${constructors[0]?.points || 0}pts) and P2 (${constructors[1]?.points || 0}pts) is ${(constructors[0]?.points || 0) - (constructors[1]?.points || 0)} points. Competitive dynamics to monitor.`,
      module: "commercial",
      timestamp: "Updated with latest standings",
    },
  ];
}

// ============================================
// TICKER HEADLINES (from real data only)
// ============================================

export function generateTickerHeadlines(
  constructors: ConstructorStanding[],
  drivers: DriverStanding[],
  nextRace: { raceName: string; date: string } | null,
  news: NewsArticle[],
): string[] {
  const headlines: string[] = [];
  const leader = drivers[0];
  const teamLeader = constructors[0];

  if (nextRace) {
    headlines.push(`🏎️ NEXT: ${nextRace.raceName} — ${nextRace.date}`);
  }
  if (leader) {
    headlines.push(`🏆 ${leader.givenName} ${leader.familyName} leads — ${leader.points}pts [Jolpica F1]`);
  }
  if (teamLeader) {
    headlines.push(`📊 ${teamLeader.constructorName} P1 constructors — ${teamLeader.points}pts [Jolpica F1]`);
  }

  // Real news headlines only
  for (const n of news.slice(0, 5)) {
    headlines.push(`📰 ${n.title} [${n.source}]`);
  }

  return headlines;
}
