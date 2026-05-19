import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchExchangeRates, getRegionalMarketData } from "@/lib/services/exchange-rate-api";

export async function GET() {
  try {
    const rates = await getOrFetch("exchangeRates", fetchExchangeRates);
    const regions = getRegionalMarketData(rates);
    return NextResponse.json({
      data: { rates, regions },
      live: true,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ data: null, live: false }, { status: 500 });
  }
}
