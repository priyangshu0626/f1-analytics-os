import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchConstructorStandings, fetchRaceResults } from "@/lib/services/f1-api";
import { fetchF1ChannelStats } from "@/lib/services/youtube-api";
import { fetchF1News } from "@/lib/services/news-api";
import { analyzeSentiment } from "@/lib/services/sentiment-api";
import { computeConstructorProfiles, computePointsProgression } from "@/lib/analytics";

export async function GET() {
  try {
    const data = await getOrFetch("commercial", async () => {
      const [constructors, ytChannels, news, results] = await Promise.all([
        fetchConstructorStandings(),
        fetchF1ChannelStats(),
        fetchF1News(10),
        fetchRaceResults(),
      ]);

      const headlines = news.map((n) => n.title);
      const sentimentResults = await analyzeSentiment(headlines);

      const profiles = computeConstructorProfiles(constructors, ytChannels, news, sentimentResults);
      const pointsProgression = computePointsProgression(results, constructors);

      return { profiles, pointsProgression };
    });

    return NextResponse.json({
      data,
      live: true,
      dataType: "CALCULATED",
      formula: "CCS = (standings_score + youtube_score + news_score + sentiment_score) / 4",
      sources: ["Jolpica F1 API", "YouTube Data API", "GNews", "HuggingFace"],
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ data: { profiles: [], pointsProgression: [] }, live: false, timestamp: new Date().toISOString() });
  }
}
