import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchF1ChannelStats, fetchF1TrendingVideos } from "@/lib/services/youtube-api";

export async function GET() {
  try {
    const [channels, trending] = await Promise.all([
      getOrFetch("youtube:channels", fetchF1ChannelStats),
      getOrFetch("youtube:trending", () => fetchF1TrendingVideos(5)),
    ]);
    return NextResponse.json({
      data: { channels, trending },
      live: true,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ data: { channels: [], trending: [] }, live: false }, { status: 500 });
  }
}
