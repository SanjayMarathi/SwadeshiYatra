import { NextRequest, NextResponse } from "next/server";
import { getPlacePhotoUrl } from "@/lib/google-places";

export async function GET(req: NextRequest) {
  const place = req.nextUrl.searchParams.get("place") || "";
  const city = req.nextUrl.searchParams.get("city") || "";

  if (!place.trim() || !city.trim()) {
    return NextResponse.json(
      { error: "place and city are required" },
      { status: 400 }
    );
  }

  try {
    const photoUrl = await getPlacePhotoUrl(place.trim(), city.trim());
    if (photoUrl) {
      return NextResponse.json({ photoUrl });
    }
    // Fallback: generate a descriptive search URL
    const fallback = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(
      `${place} ${city} India tourist attraction`
    )}`;
    return NextResponse.json({ photoUrl: null, fallbackUrl: fallback });
  } catch (err) {
    console.error("[API/place-photo] Error:", err);
    return NextResponse.json({ photoUrl: null }, { status: 502 });
  }
}
