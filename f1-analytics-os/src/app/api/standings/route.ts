import { NextResponse } from "next/server";
import { getOrFetch } from "@/lib/cache";
import { fetchDriverStandings, fetchConstructorStandings } from "@/lib/services/f1-api";

export async function GET() {
  try {
    const [drivers, constructors] = await Promise.all([
      getOrFetch("standings:drivers", fetchDriverStandings),
      getOrFetch("standings:constructors", fetchConstructorStandings),
    ]);
    return NextResponse.json({ data: { drivers, constructors }, live: true, timestamp: new Date().toISOString() });
  } catch {
    return NextResponse.json({ data: null, live: false, error: "Failed to fetch standings" }, { status: 500 });
  }
}
