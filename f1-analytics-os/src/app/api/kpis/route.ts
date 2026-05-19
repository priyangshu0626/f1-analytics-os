import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchConstructorStandings } from "@/lib/services/f1-api";
import { generateKPIs, generateSponsorEstimates, generateSocialEstimates, generateMerchEstimates } from "@/lib/services/ai-insights";
import { kpiMetrics } from "@/lib/data";

export async function GET() {
  try {
    const kpis = await getOrFetch("kpis", async () => {
      const constructors = await fetchConstructorStandings();
      const sponsors = generateSponsorEstimates(constructors);
      const social = generateSocialEstimates(constructors);
      const merch = generateMerchEstimates(constructors);
      return generateKPIs(constructors, sponsors, social, merch);
    });
    return NextResponse.json({ data: kpis, live: true, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ data: kpiMetrics, live: false, timestamp: new Date().toISOString() });
  }
}
