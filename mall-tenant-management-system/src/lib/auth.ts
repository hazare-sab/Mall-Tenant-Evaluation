import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "mall-tenant-mgmt-secret-key-2024";

export interface JWTPayload {
  userId: number;
  email: string;
  role: "admin" | "tenant";
  name: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromHeaders(headers: Headers): string | null {
  const auth = headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}

export function requireAuth(headers: Headers): JWTPayload {
  const token = getTokenFromHeaders(headers);
  if (!token) throw new Error("Not authenticated");
  const payload = verifyToken(token);
  if (!payload) throw new Error("Invalid token");
  return payload;
}

export function requireAdmin(headers: Headers): JWTPayload {
  const payload = requireAuth(headers);
  if (payload.role !== "admin") throw new Error("Admin access required");
  return payload;
}
