import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { User, UserRole } from "@/types";
import { getDb } from "@/lib/db";

const SESSION_COOKIE = "swadeshi_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verified: number;
  location: string | null;
  country: string | null;
  price: number | null;
  expertise: string | null;
};

const mapUser = (row: UserRow): User => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  verified: Boolean(row.verified),
  location: row.location ?? undefined,
  country: row.country ?? undefined,
  price: row.price ?? undefined,
  expertise: row.expertise ?? undefined,
});

const hashPassword = (password: string) => {
  const salt = randomBytes(16).toString("hex");
  const hashed = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashed}`;
};

const verifyPassword = (password: string, stored: string) => {
  const [salt, key] = stored.split(":");
  if (!salt || !key) {
    return false;
  }
  const hashedBuffer = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (hashedBuffer.length !== keyBuffer.length) {
    return false;
  }
  return timingSafeEqual(hashedBuffer, keyBuffer);
};

const createSession = async (userId: string) => {
  const db = await getDb();
  const token = `${randomUUID()}-${randomBytes(16).toString("hex")}`;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  await db.run("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)", [token, userId, expiresAt]);
  return { token, expiresAt };
};

export const setAuthCookie = async (token: string, expiresAt: number) => {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expiresAt),
    path: "/",
  });
};

export const clearAuthCookie = async () => {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  location?: string;
  country?: string;
  price?: number;
  expertise?: string;
}) => {
  const db = await getDb();
  const normalizedEmail = payload.email.trim().toLowerCase();
  const existing = await db.get<{ id: string }>("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
  if (existing) {
    throw new Error("Email already registered");
  }
  const id = randomUUID();
  const createdAt = Date.now();
  const passwordHash = hashPassword(payload.password);
  await db.run(
    "INSERT INTO users (id, name, email, password_hash, role, verified, location, country, price, expertise, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      payload.name.trim(),
      normalizedEmail,
      passwordHash,
      payload.role,
      1,
      payload.location?.trim() || null,
      payload.country?.trim() || null,
      payload.price ?? null,
      payload.expertise?.trim() || null,
      createdAt,
    ],
  );
  const row = await db.get<UserRow>(
    "SELECT id, name, email, role, verified, location, country, price, expertise FROM users WHERE id = ?",
    [id],
  );
  if (!row) {
    throw new Error("Registration failed");
  }
  const session = await createSession(id);
  return { user: mapUser(row), session };
};

export const loginUser = async (email: string, password: string) => {
  const db = await getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const row = await db.get<(UserRow & { password_hash: string })>(
    "SELECT id, name, email, role, verified, location, country, price, expertise, password_hash FROM users WHERE email = ?",
    [normalizedEmail],
  );
  if (!row) {
    throw new Error("Invalid credentials");
  }
  if (!verifyPassword(password, row.password_hash)) {
    throw new Error("Invalid credentials");
  }
  const session = await createSession(row.id);
  return { user: mapUser(row), session };
};

export const getSessionUser = async () => {
  const db = await getDb();
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  const session = await db.get<{ user_id: string; expires_at: number }>(
    "SELECT user_id, expires_at FROM sessions WHERE token = ?",
    [token],
  );
  if (!session) {
    return null;
  }
  if (session.expires_at < Date.now()) {
    await db.run("DELETE FROM sessions WHERE token = ?", [token]);
    return null;
  }
  const userRow = await db.get<UserRow>(
    "SELECT id, name, email, role, verified, location, country, price, expertise FROM users WHERE id = ?",
    [session.user_id],
  );
  if (!userRow) {
    return null;
  }
  return mapUser(userRow);
};

export const logoutSession = async () => {
  const db = await getDb();
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.run("DELETE FROM sessions WHERE token = ?", [token]);
  }
};

export const listGuidesByCities = async (cities: string[]) => {
  const normalized = cities.map((city) => city.trim()).filter(Boolean);
  if (normalized.length === 0) {
    return [] as User[];
  }
  const db = await getDb();
  const placeholders = normalized.map(() => "?").join(",");
  const rows = await db.all<UserRow[]>(
    `SELECT id, name, email, role, verified, location, country, price, expertise FROM users WHERE role = 'GUIDE' AND location IN (${placeholders})`,
    normalized,
  );
  return rows.map(mapUser);
};

export const updateCurrentUserProfile = async (userId: string, payload: {
  location?: string;
  country?: string;
  price?: number;
  expertise?: string;
}) => {
  const db = await getDb();
  await db.run(
    "UPDATE users SET location = ?, country = ?, price = ?, expertise = ? WHERE id = ?",
    [payload.location?.trim() || null, payload.country?.trim() || null, payload.price ?? null, payload.expertise?.trim() || null, userId],
  );
  const row = await db.get<UserRow>(
    "SELECT id, name, email, role, verified, location, country, price, expertise FROM users WHERE id = ?",
    [userId],
  );
  if (!row) {
    throw new Error("User not found");
  }
  return mapUser(row);
};
