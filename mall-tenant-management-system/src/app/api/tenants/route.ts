import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, users, shops } from "@/db/schema";
import { requireAuth, requireAdmin, hashPassword } from "@/lib/auth";
import { eq, ilike, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    requireAuth(req.headers);
    const search = req.nextUrl.searchParams.get("search") || "";

    const query = db
      .select({
        id: tenants.id,
        userId: tenants.userId,
        brandName: tenants.brandName,
        shopId: tenants.shopId,
        leaseStartDate: tenants.leaseStartDate,
        leaseEndDate: tenants.leaseEndDate,
        monthlyRent: tenants.monthlyRent,
        securityDeposit: tenants.securityDeposit,
        agreementDocument: tenants.agreementDocument,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        shopNumber: shops.shopNumber,
        shopFloor: shops.floor,
      })
      .from(tenants)
      .innerJoin(users, eq(tenants.userId, users.id))
      .leftJoin(shops, eq(tenants.shopId, shops.id));

    let results;
    if (search) {
      results = await query.where(
        or(
          ilike(users.name, `%${search}%`),
          ilike(users.email, `%${search}%`),
          ilike(users.phone, `%${search}%`),
          ilike(tenants.brandName, `%${search}%`),
          ilike(shops.shopNumber, `%${search}%`)
        )
      );
    } else {
      results = await query;
    }

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
    const { name, email, phone, password, brandName, shopId, leaseStartDate, leaseEndDate, monthlyRent, securityDeposit } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email required" }, { status: 400 });
    }

    const pw = await hashPassword(password || "tenant123");
    const [user] = await db.insert(users).values({
      email,
      password: pw,
      name,
      role: "tenant",
      phone: phone || "",
    }).returning();

    const [tenant] = await db.insert(tenants).values({
      userId: user.id,
      brandName: brandName || "",
      shopId: shopId || null,
      leaseStartDate: leaseStartDate || null,
      leaseEndDate: leaseEndDate || null,
      monthlyRent: monthlyRent || "0",
      securityDeposit: securityDeposit || "0",
    }).returning();

    if (shopId) {
      await db.update(shops).set({ status: "occupied", updatedAt: new Date() }).where(eq(shops.id, shopId));
    }

    return NextResponse.json({ user, tenant });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
