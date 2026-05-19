import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchConstructorStandings } from "@/lib/services/f1-api";
import { generateMerchEstimates } from "@/lib/services/ai-insights";
import { merchProducts as fallback } from "@/lib/data";

export async function GET() {
  try {
    const merch = await getOrFetch("merch", async () => {
      const constructors = await fetchConstructorStandings();
      return generateMerchEstimates(constructors);
    });
    return NextResponse.json({ data: merch, live: true, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ data: fallback, live: false, timestamp: new Date().toISOString() });
  }
}
