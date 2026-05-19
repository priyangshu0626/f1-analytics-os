import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchF1News } from "@/lib/services/news-api";

export async function GET() {
  try {
    const news = await getOrFetch("news", () => fetchF1News(10));
    return NextResponse.json({ data: news, live: true, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ data: [], live: false, error: "Failed to fetch news" }, { status: 500 });
  }
}
