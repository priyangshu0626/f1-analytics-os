// ============================================
// F1 ANALYTICS OS — YOUTUBE DATA API v3
// ============================================
// Fetches real subscriber/view counts for F1 team channels.
// Enriches social metrics with actual YouTube data.

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YT_BASE = "https://www.googleapis.com/youtube/v3";

// F1 team YouTube channel IDs (verified)
const F1_CHANNELS: Record<string, string> = {
  formula1: "UCB_qr75-ydFVKSYg0MUxl-A",
  mercedes: "UCIEPxmhxzTUaFNWI2p43GYQ",
  ferrari: "UCELpMiLEhJSMR-RaSJHIOyA",
  red_bull: "UCea3USf0bMR9tLtFSrbuSOA",
  mclaren: "UCmFnsr6rKLYqjf9GHipcFcQ",
  alpine: "UCwMQb6bU9XI-z_vJCaBXYSg",
  aston_martin: "UCH1MCMj7oy7Y9A-6oFOe3Cg",
  williams: "UC5dRuzQ-fM7yRjXFVOLcf_g",
  haas: "UCWFH_cOqUIpO3v3h1PUnrXQ",
};

export interface YouTubeChannelStats {
  channelId: string;
  teamKey: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
}

export interface YouTubeVideoTrend {
  title: string;
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  channelTitle: string;
}

export async function fetchF1ChannelStats(): Promise<YouTubeChannelStats[]> {
  if (!YOUTUBE_API_KEY) return [];

  const ids = Object.values(F1_CHANNELS).join(",");
  const url = `${YT_BASE}/channels?part=statistics&id=${ids}&key=${YOUTUBE_API_KEY}`;

  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) {
      console.error(`YouTube API error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.items || []).map((item: any) => {
      const teamKey = Object.entries(F1_CHANNELS).find(([, id]) => id === item.id)?.[0] || "unknown";
      return {
        channelId: item.id,
        teamKey,
        subscriberCount: parseInt(item.statistics?.subscriberCount || "0"),
        viewCount: parseInt(item.statistics?.viewCount || "0"),
        videoCount: parseInt(item.statistics?.videoCount || "0"),
      };
    });
  } catch (err) {
    console.error("YouTube channel stats error:", err);
    return [];
  }
}

export async function fetchF1TrendingVideos(maxResults: number = 5): Promise<YouTubeVideoTrend[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    // Search for recent F1 videos
    const searchUrl = `${YT_BASE}/search?part=snippet&q=Formula+1+2026&type=video&order=viewCount&maxResults=${maxResults}&publishedAfter=${getOneWeekAgo()}&key=${YOUTUBE_API_KEY}`;
    const searchRes = await fetch(searchUrl, { next: { revalidate: 86400 } });
    if (!searchRes.ok) return [];
    const searchData = await searchRes.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const videoIds = (searchData.items || []).map((i: any) => i.id?.videoId).filter(Boolean).join(",");
    if (!videoIds) return [];

    // Get stats for those videos
    const statsUrl = `${YT_BASE}/videos?part=statistics,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;
    const statsRes = await fetch(statsUrl, { next: { revalidate: 86400 } });
    if (!statsRes.ok) return [];
    const statsData = await statsRes.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (statsData.items || []).map((v: any) => ({
      title: v.snippet?.title || "",
      viewCount: parseInt(v.statistics?.viewCount || "0"),
      likeCount: parseInt(v.statistics?.likeCount || "0"),
      publishedAt: v.snippet?.publishedAt || "",
      channelTitle: v.snippet?.channelTitle || "",
    }));
  } catch (err) {
    console.error("YouTube trending error:", err);
    return [];
  }
}

function getOneWeekAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
}
