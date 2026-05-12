import { NextResponse } from "next/server";
import { sponsors } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ data: sponsors });
}
