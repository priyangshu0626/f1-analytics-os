import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchConstructorStandings } from "@/lib/services/f1-api";
import { generateSocialEstimates } from "@/lib/services/ai-insights";
import { teamSocialData as fallback } from "@/lib/data";

export async function GET() {
  try {
    const social = await getOrFetch("fans", async () => {
      const constructors = await fetchConstructorStandings();
      return generateSocialEstimates(constructors);
    });
    return NextResponse.json({ data: social, live: true, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ data: fallback, live: false, timestamp: new Date().toISOString() });
  }
}
