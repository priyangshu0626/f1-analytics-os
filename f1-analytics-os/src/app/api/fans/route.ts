import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchF1ChannelStats } from "@/lib/services/youtube-api";
import { fetchF1News } from "@/lib/services/news-api";
import { analyzeSentiment, aggregateSentiment } from "@/lib/services/sentiment-api";

export async function GET() {
  try {
    const data = await getOrFetch("fans", async () => {
      const [ytChannels, news] = await Promise.all([
        fetchF1ChannelStats(),
        fetchF1News(10),
      ]);

      const headlines = news.map((n) => n.title);
      const sentimentResults = await analyzeSentiment(headlines);
      const overallSentiment = aggregateSentiment(sentimentResults);

      return {
        youtube: ytChannels, // REAL subscriber/view counts
        newsArticles: news.length,
        sentiment: overallSentiment,
        sentimentBreakdown: sentimentResults.map((s) => ({
          headline: s.text,
          label: s.label,
          confidence: Math.round(s.score * 100),
        })),
      };
    });

    return NextResponse.json({
      data,
      live: true,
      dataType: "LIVE DATA",
      sources: ["YouTube Data API", "GNews", "NewsData.io", "HuggingFace NLP"],
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      data: { youtube: [], newsArticles: 0, sentiment: { score: 0, positive: 0, neutral: 0, negative: 0 }, sentimentBreakdown: [] },
      live: false,
      timestamp: new Date().toISOString(),
    });
  }
}
