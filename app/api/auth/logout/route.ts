import { NextResponse } from "next/server";
import { clearAuthCookie, logoutSession } from "@/lib/server-auth";

export async function POST() {
  await logoutSession();
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}
