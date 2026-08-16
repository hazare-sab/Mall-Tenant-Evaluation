import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { payments, tenants, users, notifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const payload = requireAuth(req.headers);
    const { id } = await params;
    const body = await req.json();
    const paymentId = parseInt(id);

    const updateData: Record<string, unknown> = { updatedAt: new Date() };

    // Tenant can upload proof
    if (payload.role === "tenant") {
      if (body.proofUrl) updateData.proofUrl = body.proofUrl;
      if (body.proofType) updateData.proofType = body.proofType;
      if (body.paymentDate) updateData.paymentDate = body.paymentDate;
    }

    // Admin can approve/reject
    if (payload.role === "admin") {
      if (body.status) updateData.status = body.status;
      if (body.rejectionReason) updateData.rejectionReason = body.rejectionReason;
      if (body.paymentDate) updateData.paymentDate = body.paymentDate;

      // Create notification for tenant
      if (body.status === "approved" || body.status === "rejected") {
        const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId));
        if (payment) {
          const [tenant] = await db.select().from(tenants).where(eq(tenants.id, payment.tenantId));
          if (tenant) {
            await db.insert(notifications).values({
              userId: tenant.userId,
              type: body.status === "approved" ? "payment_approved" : "payment_rejected",
              title: body.status === "approved" ? "Payment Approved" : "Payment Rejected",
              message: body.status === "approved"
                ? `Your rent payment of ₹${payment.amount} has been approved.`
                : `Your rent payment was rejected. Reason: ${body.rejectionReason || "Not specified"}`,
            });
          }
        }
      }
    }

    const [updated] = await db.update(payments).set(updateData).where(eq(payments.id, paymentId)).returning();
    return NextResponse.json(updated);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
