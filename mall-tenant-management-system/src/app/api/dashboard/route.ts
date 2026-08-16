import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { shops, tenants, payments } from "@/db/schema";
import { eq, count, sum, and, sql, lt, gte } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    requireAdmin(req.headers);

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Total shops
    const [totalShops] = await db.select({ c: count() }).from(shops);

    // Occupied shops
    const [occupiedShops] = await db.select({ c: count() }).from(shops).where(eq(shops.status, "occupied"));

    // Vacant shops
    const vacantShops = totalShops.c - occupiedShops.c;

    // Total tenants
    const [totalTenants] = await db.select({ c: count() }).from(tenants);

    // Pending payment approvals
    const [pendingPayments] = await db.select({ c: count() }).from(payments).where(eq(payments.status, "pending"));

    // Rent collected this month (approved payments)
    const [rentCollected] = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(
        and(
          eq(payments.status, "approved"),
          eq(payments.month, currentMonth),
          eq(payments.year, currentYear)
        )
      );

    // Overdue payments (pending and due date passed)
    const today = now.toISOString().split("T")[0];
    const [overduePayments] = await db
      .select({ c: count() })
      .from(payments)
      .where(
        and(
          eq(payments.status, "pending"),
          lt(payments.dueDate, today)
        )
      );

    // Upcoming lease expirations (within 90 days)
    const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const [leaseExpiring] = await db
      .select({ c: count() })
      .from(tenants)
      .where(
        and(
          gte(tenants.leaseEndDate, today),
          lt(tenants.leaseEndDate, futureDate)
        )
      );

    // Monthly collection data for chart (last 6 months)
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1 - i, 1);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const [data] = await db
        .select({ total: sum(payments.amount) })
        .from(payments)
        .where(
          and(
            eq(payments.status, "approved"),
            eq(payments.month, m),
            eq(payments.year, y)
          )
        );
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      monthlyData.push({
        month: monthNames[m - 1],
        year: y,
        amount: parseFloat(data.total || "0"),
      });
    }

    return NextResponse.json({
      totalShops: totalShops.c,
      occupiedShops: occupiedShops.c,
      vacantShops,
      totalTenants: totalTenants.c,
      pendingPayments: pendingPayments.c,
      rentCollected: parseFloat(rentCollected.total || "0"),
      overduePayments: overduePayments.c,
      leaseExpiring: leaseExpiring.c,
      monthlyData,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ error: msg }, { status: 401 });
  }
}
