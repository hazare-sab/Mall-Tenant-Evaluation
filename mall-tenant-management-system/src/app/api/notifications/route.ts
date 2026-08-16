import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, tenants, users } from "@/db/schema";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req.headers);
    const results = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, payload.userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);
    return NextResponse.json(results);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    requireAdmin(req.headers);
    const body = await req.json();
    const { userId, type, title, message, sendToAll } = body;

    if (sendToAll) {
      const allTenantUsers = await db
        .select({ userId: users.id })
        .from(users)
        .where(eq(users.role, "tenant"));
      
      for (const u of allTenantUsers) {
        await db.insert(notifications).values({
          userId: u.userId,
          type: type || "general",
          title,
          message,
        });
      }
      return NextResponse.json({ success: true, count: allTenantUsers.length });
    }

    const [notif] = await db.insert(notifications).values({
      userId,
      type: type || "general",
      title,
      message,
    }).returning();

    return NextResponse.json(notif);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
