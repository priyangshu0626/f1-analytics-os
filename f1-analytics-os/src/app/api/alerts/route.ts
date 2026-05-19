import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchConstructorStandings, fetchDriverStandings, fetchRaceResults } from "@/lib/services/f1-api";
import { fetchF1News } from "@/lib/services/news-api";
import { generateStrategicAlerts } from "@/lib/services/ai-insights";
import { fallbackAlerts } from "@/lib/data";

export async function GET() {
  try {
    const alerts = await getOrFetch("alerts", async () => {
      const [constructors, drivers, results, news] = await Promise.all([
        fetchConstructorStandings(), fetchDriverStandings(), fetchRaceResults(), fetchF1News(10),
      ]);
      return generateStrategicAlerts(constructors, drivers, results, news);
    });

    return NextResponse.json({
      data: alerts,
      live: true,
      dataType: "AI SUMMARY",
      disclaimer: "AI interpretation of real standings data. No fabricated statistics.",
      source: "Gemini 2.5 Pro (interpreting Jolpica + GNews data)",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      data: fallbackAlerts,
      live: false,
      dataType: "AI SUMMARY",
      timestamp: new Date().toISOString(),
    });
  }
}
