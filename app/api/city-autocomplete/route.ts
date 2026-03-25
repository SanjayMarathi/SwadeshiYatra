import { NextRequest, NextResponse } from "next/server";
import { searchCities } from "@/lib/google-places";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  if (!query.trim() || query.trim().length < 2) {
    return NextResponse.json({ cities: [] });
  }
  try {
    const cities = await searchCities(query.trim());
    return NextResponse.json({ cities });
  } catch (err) {
    console.error("[API/city-autocomplete] Error:", err);
    return NextResponse.json({ cities: [] });
  }
}
