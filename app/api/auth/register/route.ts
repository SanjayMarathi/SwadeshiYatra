import { NextResponse } from "next/server";
import { UserRole } from "@/types";
import { registerUser, setAuthCookie } from "@/lib/server-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "TOURIST") as UserRole;
    const location = String(body.location ?? "").trim();
    const country = String(body.country ?? "").trim();
    const price = body.price ? Number(body.price) : undefined;
    const expertise = String(body.expertise ?? "").trim();
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email and password are required." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
    }
    if (role !== "TOURIST" && role !== "GUIDE") {
      return NextResponse.json({ message: "Only tourist and guide registration is allowed." }, { status: 400 });
    }
    const { user, session } = await registerUser({
      name,
      email,
      password,
      role,
      location: location || undefined,
      country: country || undefined,
      price,
      expertise: expertise || undefined,
    });
    await setAuthCookie(session.token, session.expiresAt);
    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ message }, { status: 400 });
  }
}
