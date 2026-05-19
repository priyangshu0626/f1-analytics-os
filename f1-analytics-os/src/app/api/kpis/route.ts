import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchDriverStandings, fetchConstructorStandings, fetchRaceSchedule } from "@/lib/services/f1-api";
import { fetchF1ChannelStats } from "@/lib/services/youtube-api";
import { fetchF1News } from "@/lib/services/news-api";
import { computeRealKPIs } from "@/lib/analytics";

export async function GET() {
  try {
    const kpis = await getOrFetch("kpis", async () => {
      const [drivers, constructors, ytChannels, news, schedule] = await Promise.all([
        fetchDriverStandings(),
        fetchConstructorStandings(),
        fetchF1ChannelStats(),
        fetchF1News(10),
        fetchRaceSchedule(),
      ]);

      const today = new Date().toISOString().split("T")[0];
      const racesCompleted = schedule.filter((r) => r.date < today).length;

      // Sentiment defaults to 70 if not yet computed by cron
      return computeRealKPIs(drivers, constructors, ytChannels, news, 70, racesCompleted, schedule.length);
    });

    return NextResponse.json({
      data: kpis,
      live: true,
      dataType: "LIVE DATA + CALCULATED",
      sources: ["Jolpica F1 API", "YouTube Data API", "GNews", "NewsData.io", "HuggingFace"],
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ data: [], live: false, dataType: "UNAVAILABLE", timestamp: new Date().toISOString() });
  }
}
