import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shops } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req.headers);
    const { id } = await params;
    const body = await req.json();
    const [shop] = await db.update(shops).set({
      shopNumber: body.shopNumber,
      floor: body.floor,
      shopSize: body.shopSize,
      category: body.category,
      status: body.status,
      updatedAt: new Date(),
    }).where(eq(shops.id, parseInt(id))).returning();
    return NextResponse.json(shop);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireAdmin(req.headers);
    const { id } = await params;
    await db.delete(shops).where(eq(shops.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
