import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchF1CountryData } from "@/lib/services/countries-api";

export async function GET() {
  try {
    const countries = await getOrFetch("countries", fetchF1CountryData, 7 * 24 * 60 * 60 * 1000);
    return NextResponse.json({
      data: countries,
      live: true,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ data: [], live: false }, { status: 500 });
  }
}
