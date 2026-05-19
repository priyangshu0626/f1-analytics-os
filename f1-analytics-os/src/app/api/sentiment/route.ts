import { NextResponse } from "next/server";
import { getCache } from "@/lib/cache";

export async function GET() {
  const sentiment = getCache<{ score: number; positive: number; neutral: number; negative: number }>("sentiment");
  return NextResponse.json({
    data: sentiment || { score: 70, positive: 50, neutral: 35, negative: 15 },
    live: !!sentiment,
    timestamp: new Date().toISOString(),
  });
}
