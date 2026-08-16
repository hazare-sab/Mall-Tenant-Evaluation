import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req.headers);
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      phone: users.phone,
    }).from(users).where(eq(users.id, payload.userId));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let tenantInfo = null;
    if (user.role === "tenant") {
      const [t] = await db.select().from(tenants).where(eq(tenants.userId, user.id));
      tenantInfo = t || null;
    }

    return NextResponse.json({ user, tenantInfo });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
