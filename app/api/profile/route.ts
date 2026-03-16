import { NextResponse } from "next/server";
import { getSessionUser, updateCurrentUserProfile } from "@/lib/server-auth";

export async function PUT(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const location = String(body.location ?? "").trim();
  const country = String(body.country ?? "").trim();
  const expertise = String(body.expertise ?? "").trim();
  const price = body.price ? Number(body.price) : undefined;
  const user = await updateCurrentUserProfile(sessionUser.id, {
    location: location || undefined,
    country: country || undefined,
    expertise: expertise || undefined,
    price,
  });
  return NextResponse.json({ user });
}
