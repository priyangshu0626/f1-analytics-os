import { NextResponse } from "next/server";
import { teamSocialData } from "@/lib/data";

export async function GET() {
  return NextResponse.json({ data: teamSocialData });
}
