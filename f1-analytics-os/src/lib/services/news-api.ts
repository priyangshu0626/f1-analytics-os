// ============================================
// F1 ANALYTICS OS — MULTI-SOURCE NEWS API
// ============================================
// Combines GNews + NewsData.io for maximum coverage.
// Deduplicates and ranks by recency.

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || "";
const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY || "";

export interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
  publishedAt: string;
  image?: string;
  sentiment?: "positive" | "neutral" | "negative";
}

export async function fetchF1News(max: number = 10): Promise<NewsArticle[]> {
  const [gnewsArticles, newsdataArticles] = await Promise.all([
    fetchFromGNews(max),
    fetchFromNewsData(max),
  ]);

  // Combine and deduplicate by title similarity
  const combined = [...gnewsArticles];
  for (const article of newsdataArticles) {
    const isDuplicate = combined.some((a) =>
      a.title.toLowerCase().includes(article.title.toLowerCase().slice(0, 30)) ||
      article.title.toLowerCase().includes(a.title.toLowerCase().slice(0, 30))
    );
    if (!isDuplicate) combined.push(article);
  }

  // Sort by date (newest first)
  combined.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return combined.slice(0, max);
}

async function fetchFromGNews(max: number): Promise<NewsArticle[]> {
  if (!GNEWS_API_KEY) return [];

  try {
    const url = `https://gnews.io/api/v4/search?q=Formula+1+OR+F1&lang=en&max=${max}&sortby=publishedAt&apikey=${GNEWS_API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      console.error(`GNews API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.articles || []).map((a: any) => ({
      title: a.title || "",
      description: a.description || "",
      source: a.source?.name || "GNews",
      url: a.url || "",
      publishedAt: a.publishedAt || new Date().toISOString(),
      image: a.image,
    }));
  } catch (err) {
    console.error("GNews fetch error:", err);
    return [];
  }
}

async function fetchFromNewsData(max: number): Promise<NewsArticle[]> {
  if (!NEWSDATA_API_KEY) return [];

  try {
    const url = `https://newsdata.io/api/1/news?apikey=${NEWSDATA_API_KEY}&q=formula+1+OR+F1&language=en&size=${Math.min(max, 10)}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      console.error(`NewsData.io API error: ${res.status}`);
      return [];
    }

    const data = await res.json();
    if (data.status !== "success") return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.results || []).map((a: any) => ({
      title: a.title || "",
      description: a.description || a.content?.slice(0, 200) || "",
      source: a.source_name || a.source_id || "NewsData",
      url: a.link || "",
      publishedAt: a.pubDate || new Date().toISOString(),
      image: a.image_url,
    }));
  } catch (err) {
    console.error("NewsData.io fetch error:", err);
    return [];
  }
}

export function getStaticFallbackNews(): NewsArticle[] {
  const now = new Date().toISOString();
  return [
    { title: "2026 F1 Season: Mercedes dominates early rounds", description: "Antonelli and Russell lead the championship after four races.", source: "F1 Analytics OS", url: "#", publishedAt: now },
    { title: "New 2026 regulations reshape the F1 grid", description: "Revised power unit rules create surprises in constructor standings.", source: "F1 Analytics OS", url: "#", publishedAt: now },
    { title: "McLaren's commercial growth accelerates", description: "Digital engagement metrics show McLaren as fastest-growing F1 brand.", source: "F1 Analytics OS", url: "#", publishedAt: now },
    { title: "Cadillac and Audi join the 2026 F1 grid", description: "Two new manufacturers enter Formula 1 under the new regulations.", source: "F1 Analytics OS", url: "#", publishedAt: now },
    { title: "Ferrari targets championship challenge", description: "Leclerc and Hamilton form strongest driver pairing on the grid.", source: "F1 Analytics OS", url: "#", publishedAt: now },
  ];
}
