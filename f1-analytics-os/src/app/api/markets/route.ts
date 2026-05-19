import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchExchangeRates, getRegionalMarketData } from "@/lib/services/exchange-rate-api";
import { fetchF1CountryData } from "@/lib/services/countries-api";

export async function GET() {
  try {
    const data = await getOrFetch("markets", async () => {
      const [rates, countries] = await Promise.all([
        fetchExchangeRates(),
        fetchF1CountryData(),
      ]);
      const regions = getRegionalMarketData(rates);
      return { rates, regions, countries };
    });

    return NextResponse.json({
      data,
      live: true,
      dataType: "LIVE DATA",
      sources: ["ExchangeRate API", "REST Countries API"],
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ data: null, live: false, timestamp: new Date().toISOString() });
  }
}
