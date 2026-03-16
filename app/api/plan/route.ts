import { NextRequest, NextResponse } from "next/server";
import { analyzeFeasibility, generateItinerary } from "@/lib/gemini";
import { TouristPlace } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { budget, durationDays, cities, places, originCountry, foodPreference, travelPreference } = body;

    const input = {
      budget: Number(budget),
      durationDays: Number(durationDays),
      cities: cities as string[],
      places: places as Pick<TouristPlace, "name">[],
      originCountry: originCountry as string,
      foodPreference: foodPreference as "VEG" | "NON-VEG" | "BOTH",
      travelPreference: travelPreference as "PUBLIC" | "PRIVATE" | "BOTH",
    };

    const [feasibility, itinerary] = await Promise.all([
      analyzeFeasibility(input),
      generateItinerary(input),
    ]);

    return NextResponse.json({ feasibility, itinerary });
  } catch (err) {
    console.error("[API/plan] Error:", err);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}
