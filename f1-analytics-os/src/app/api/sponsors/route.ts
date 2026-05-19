import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchConstructorStandings, fetchRaceResults } from "@/lib/services/f1-api";
import { fetchF1ChannelStats } from "@/lib/services/youtube-api";
import { fetchF1News } from "@/lib/services/news-api";
import { analyzeSentiment } from "@/lib/services/sentiment-api";
import { computeConstructorProfiles, computePointsProgression } from "@/lib/analytics";

// Redirect old /api/sponsors to new /api/commercial
export async function GET() {
  try {
    const data = await getOrFetch("commercial", async () => {
      const [constructors, ytChannels, news, results] = await Promise.all([
        fetchConstructorStandings(), fetchF1ChannelStats(), fetchF1News(10), fetchRaceResults(),
      ]);
      const sentimentResults = await analyzeSentiment(news.map((n) => n.title));
      return {
        profiles: computeConstructorProfiles(constructors, ytChannels, news, sentimentResults),
        pointsProgression: computePointsProgression(results, constructors),
      };
    });
    return NextResponse.json({ data: data.profiles, live: true, dataType: "CALCULATED", timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ data: [], live: false, timestamp: new Date().toISOString() });
  }
}
