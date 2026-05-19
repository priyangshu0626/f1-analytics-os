import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchAllRaceWeather } from "@/lib/services/weather-api";
import { fetchRaceSchedule } from "@/lib/services/f1-api";

export async function GET() {
  try {
    const weather = await getOrFetch("weather", async () => {
      const schedule = await fetchRaceSchedule();
      return fetchAllRaceWeather(schedule);
    });
    return NextResponse.json({
      data: weather,
      live: true,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ data: [], live: false }, { status: 500 });
  }
}
