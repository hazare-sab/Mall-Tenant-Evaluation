import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, shops, tenants, payments, notifications } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { eq, count } from "drizzle-orm";

export async function POST() {
  try {
    // Check if admin already exists
    const [existing] = await db.select({ c: count() }).from(users).where(eq(users.role, "admin"));
    if (existing && existing.c > 0) {
      return NextResponse.json({ message: "Already seeded" });
    }

    const adminPw = await hashPassword("admin123");
    const tenantPw = await hashPassword("tenant123");

    // Create admin
    await db.insert(users).values({
      email: "admin@mallmgmt.com",
      password: adminPw,
      name: "Mall Admin",
      role: "admin",
      phone: "9876543210",
    });

    // Create sample shops
    const shopData = [
      { shopNumber: "G-101", floor: 0, shopSize: "500 sq ft", category: "Fashion", status: "occupied" as const },
      { shopNumber: "G-102", floor: 0, shopSize: "600 sq ft", category: "Electronics", status: "occupied" as const },
      { shopNumber: "G-103", floor: 0, shopSize: "400 sq ft", category: "Food Court", status: "vacant" as const },
      { shopNumber: "F1-201", floor: 1, shopSize: "800 sq ft", category: "Fashion", status: "occupied" as const },
      { shopNumber: "F1-202", floor: 1, shopSize: "450 sq ft", category: "Jewelry", status: "vacant" as const },
      { shopNumber: "F2-301", floor: 2, shopSize: "1000 sq ft", category: "Entertainment", status: "vacant" as const },
    ];
    const insertedShops = await db.insert(shops).values(shopData).returning();

    // Create sample tenants
    const tenantUsers = [
      { email: "rahul@fashion.com", password: tenantPw, name: "Rahul Sharma", role: "tenant" as const, phone: "9812345001" },
      { email: "priya@electronics.com", password: tenantPw, name: "Priya Patel", role: "tenant" as const, phone: "9812345002" },
      { email: "amit@retail.com", password: tenantPw, name: "Amit Kumar", role: "tenant" as const, phone: "9812345003" },
    ];
    const insertedUsers = await db.insert(users).values(tenantUsers).returning();

    const tenantsData = [
      {
        userId: insertedUsers[0].id,
        brandName: "Fashion Hub",
        shopId: insertedShops[0].id,
        leaseStartDate: "2024-01-01",
        leaseEndDate: "2025-12-31",
        monthlyRent: "45000",
        securityDeposit: "135000",
      },
      {
        userId: insertedUsers[1].id,
        brandName: "Tech World",
        shopId: insertedShops[1].id,
        leaseStartDate: "2024-03-01",
        leaseEndDate: "2026-02-28",
        monthlyRent: "55000",
        securityDeposit: "165000",
      },
      {
        userId: insertedUsers[2].id,
        brandName: "Style Avenue",
        shopId: insertedShops[3].id,
        leaseStartDate: "2024-06-01",
        leaseEndDate: "2025-05-31",
        monthlyRent: "72000",
        securityDeposit: "216000",
      },
    ];
    const insertedTenants = await db.insert(tenants).values(tenantsData).returning();

    // Create sample payments
    const now = new Date();
    const paymentData = [
      { tenantId: insertedTenants[0].id, amount: "45000", dueDate: "2025-01-05", paymentDate: "2025-01-03", status: "approved" as const, month: 1, year: 2025 },
      { tenantId: insertedTenants[0].id, amount: "45000", dueDate: "2025-02-05", paymentDate: "2025-02-04", status: "approved" as const, month: 2, year: 2025 },
      { tenantId: insertedTenants[0].id, amount: "45000", dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`, status: "pending" as const, month: now.getMonth() + 1, year: now.getFullYear() },
      { tenantId: insertedTenants[1].id, amount: "55000", dueDate: "2025-01-05", paymentDate: "2025-01-02", status: "approved" as const, month: 1, year: 2025 },
      { tenantId: insertedTenants[1].id, amount: "55000", dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`, status: "pending" as const, month: now.getMonth() + 1, year: now.getFullYear() },
      { tenantId: insertedTenants[2].id, amount: "72000", dueDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-05`, status: "pending" as const, month: now.getMonth() + 1, year: now.getFullYear() },
    ];
    await db.insert(payments).values(paymentData);

    // Create sample notifications
    for (const u of insertedUsers) {
      await db.insert(notifications).values({
        userId: u.id,
        type: "rent_due",
        title: "Rent Due Reminder",
        message: `Your rent payment for this month is due on the 5th. Please upload your payment proof.`,
      });
    }

    return NextResponse.json({ message: "Database seeded successfully" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Seed failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
