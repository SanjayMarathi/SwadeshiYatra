import { NextResponse } from "next/server";
import { listGuidesByCities } from "@/lib/server-auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cities = searchParams.getAll("city");
  const guides = await listGuidesByCities(cities);
  return NextResponse.json({ guides });
}
