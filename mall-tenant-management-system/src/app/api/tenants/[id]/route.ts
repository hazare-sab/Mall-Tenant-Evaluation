import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, users, shops } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req.headers);
    const { id } = await params;
    const body = await req.json();
    const tenantId = parseInt(id);

    // Get current tenant to check if shop changed
    const [current] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    if (!current) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    // Update user info
    await db.update(users).set({
      name: body.name,
      email: body.email,
      phone: body.phone,
      updatedAt: new Date(),
    }).where(eq(users.id, current.userId));

    // If shop changed, update old and new shop status
    if (current.shopId && current.shopId !== body.shopId) {
      await db.update(shops).set({ status: "vacant", updatedAt: new Date() }).where(eq(shops.id, current.shopId));
    }
    if (body.shopId && body.shopId !== current.shopId) {
      await db.update(shops).set({ status: "occupied", updatedAt: new Date() }).where(eq(shops.id, body.shopId));
    }

    const [tenant] = await db.update(tenants).set({
      brandName: body.brandName,
      shopId: body.shopId || null,
      leaseStartDate: body.leaseStartDate || null,
      leaseEndDate: body.leaseEndDate || null,
      monthlyRent: body.monthlyRent || "0",
      securityDeposit: body.securityDeposit || "0",
      updatedAt: new Date(),
    }).where(eq(tenants.id, tenantId)).returning();

    return NextResponse.json(tenant);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req.headers);
    const { id } = await params;
    const tenantId = parseInt(id);

    const [current] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    if (current?.shopId) {
      await db.update(shops).set({ status: "vacant", updatedAt: new Date() }).where(eq(shops.id, current.shopId));
    }
    if (current) {
      await db.delete(users).where(eq(users.id, current.userId));
    }
    await db.delete(tenants).where(eq(tenants.id, tenantId));
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
