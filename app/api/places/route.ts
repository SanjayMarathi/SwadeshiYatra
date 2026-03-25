import { NextRequest, NextResponse } from "next/server";
import { getTouristPlaces } from "@/lib/gemini";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") || "";
  if (!city.trim()) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }
  try {
    const places = await getTouristPlaces(city.trim());
    return NextResponse.json({ places });
  } catch (err) {
    console.error("[API/places] Error:", err);
    const message = err instanceof Error ? err.message : "Gemini not giving data alert";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
