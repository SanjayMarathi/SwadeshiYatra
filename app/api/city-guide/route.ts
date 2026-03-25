import { NextRequest, NextResponse } from "next/server";
import { getCityPlannerData } from "@/lib/gemini";

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") || "";
  if (!city.trim()) {
    return NextResponse.json({ error: "city is required" }, { status: 400 });
  }
  try {
    const data = await getCityPlannerData(city.trim());
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[API/city-guide] Error:", err);
    const message = err instanceof Error ? err.message : "Gemini not giving data alert";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
