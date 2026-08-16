import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, tenants, users, shops, notifications } from "@/db/schema";
import { requireAuth } from "@/lib/auth";
import { eq, desc, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const payload = requireAuth(req.headers);
    const status = req.nextUrl.searchParams.get("status") || "";
    const tenantIdParam = req.nextUrl.searchParams.get("tenantId") || "";

    const query = db
      .select({
        id: payments.id,
        tenantId: payments.tenantId,
        amount: payments.amount,
        dueDate: payments.dueDate,
        paymentDate: payments.paymentDate,
        status: payments.status,
        proofUrl: payments.proofUrl,
        proofType: payments.proofType,
        rejectionReason: payments.rejectionReason,
        month: payments.month,
        year: payments.year,
        createdAt: payments.createdAt,
        tenantName: users.name,
        brandName: tenants.brandName,
        shopNumber: shops.shopNumber,
      })
      .from(payments)
      .innerJoin(tenants, eq(payments.tenantId, tenants.id))
      .innerJoin(users, eq(tenants.userId, users.id))
      .leftJoin(shops, eq(tenants.shopId, shops.id));

    const conditions = [];

    if (payload.role === "tenant") {
      const [tenantRecord] = await db.select().from(tenants).where(eq(tenants.userId, payload.userId));
      if (tenantRecord) {
        conditions.push(eq(payments.tenantId, tenantRecord.id));
      }
    }

    if (status) {
      conditions.push(eq(payments.status, status as "pending" | "approved" | "rejected"));
    }

    if (tenantIdParam) {
      conditions.push(eq(payments.tenantId, parseInt(tenantIdParam)));
    }

    let results;
    if (conditions.length > 0) {
      results = await query.where(and(...conditions)).orderBy(desc(payments.createdAt));
    } else {
      results = await query.orderBy(desc(payments.createdAt));
    }

    return NextResponse.json(results);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req.headers);
    const body = await req.json();

    let tenantId = body.tenantId;
    if (payload.role === "tenant") {
      const [tenantRecord] = await db.select().from(tenants).where(eq(tenants.userId, payload.userId));
      if (!tenantRecord) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
      }
      tenantId = tenantRecord.id;
    }

    const [payment] = await db.insert(payments).values({
      tenantId,
      amount: body.amount,
      dueDate: body.dueDate,
      paymentDate: body.paymentDate || null,
      status: "pending",
      proofUrl: body.proofUrl || null,
      proofType: body.proofType || null,
      month: body.month,
      year: body.year,
    }).returning();

    return NextResponse.json(payment);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
