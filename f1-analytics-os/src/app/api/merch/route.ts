import { NextResponse } from "next/server";
import { merchProducts } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ data: merchProducts });
}
