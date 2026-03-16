import { NextResponse } from "next/server";
import { loginUser, setAuthCookie } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }
    const { user, session } = await loginUser(email, password);
    await setAuthCookie(session.token, session.expiresAt);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }
}
