import { NextResponse } from "next/server";
import { kpiMetrics } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ data: kpiMetrics });
}
