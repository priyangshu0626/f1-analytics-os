import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchConstructorStandings, fetchDriverStandings, fetchRaceResults } from "@/lib/services/f1-api";
import { fetchF1News } from "@/lib/services/news-api";
import { generateStrategicAlerts } from "@/lib/services/ai-insights";
import { aiInsights } from "@/lib/data";

export async function GET() {
  try {
    const alerts = await getOrFetch("alerts", async () => {
      const [constructors, drivers, results, news] = await Promise.all([
        fetchConstructorStandings(),
        fetchDriverStandings(),
        fetchRaceResults(),
        fetchF1News(5),
      ]);
      return generateStrategicAlerts(constructors, drivers, results, news);
    });
    return NextResponse.json({ data: alerts, live: true, timestamp: new Date().toISOString() });
  } catch {
    // Fallback to static alerts
    return NextResponse.json({ data: aiInsights, live: false, timestamp: new Date().toISOString() });
  }
}
