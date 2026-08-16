import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shops } from "@/db/schema";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { eq, ilike, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    requireAuth(req.headers);
    const search = req.nextUrl.searchParams.get("search") || "";
    const status = req.nextUrl.searchParams.get("status") || "";

    let query = db.select().from(shops).$dynamic();

    if (search) {
      query = query.where(
        or(
          ilike(shops.shopNumber, `%${search}%`),
          ilike(shops.category, `%${search}%`)
        )
      );
    }

    if (status === "vacant" || status === "occupied") {
      query = query.where(eq(shops.status, status));
    }

    const results = await query.orderBy(shops.shopNumber);
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
    const { shopNumber, floor, shopSize, category } = body;
    if (!shopNumber) {
      return NextResponse.json({ error: "Shop number required" }, { status: 400 });
    }
    const [shop] = await db.insert(shops).values({
      shopNumber,
      floor: floor || 0,
      shopSize: shopSize || "",
      category: category || "",
      status: "vacant",
    }).returning();
    return NextResponse.json(shop);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
