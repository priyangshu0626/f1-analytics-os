import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchConstructorStandings } from "@/lib/services/f1-api";
import { generateSponsorEstimates } from "@/lib/services/ai-insights";
import { sponsors as fallback } from "@/lib/data";

export async function GET() {
  try {
    const sponsors = await getOrFetch("sponsors", async () => {
      const constructors = await fetchConstructorStandings();
      return generateSponsorEstimates(constructors);
    });
    return NextResponse.json({ data: sponsors, live: true, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ data: fallback, live: false, timestamp: new Date().toISOString() });
  }
}
