import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  boolean,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["admin", "tenant"]);
export const occupancyStatusEnum = pgEnum("occupancy_status", ["vacant", "occupied"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "approved", "rejected"]);
export const notificationTypeEnum = pgEnum("notification_type", [
  "rent_due",
  "payment_approved",
  "payment_rejected",
  "lease_expiry",
  "general",
]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: userRoleEnum("role").notNull().default("tenant"),
  phone: varchar("phone", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shops = pgTable("shops", {
  id: serial("id").primaryKey(),
  shopNumber: varchar("shop_number", { length: 50 }).notNull().unique(),
  floor: integer("floor").notNull().default(0),
  shopSize: varchar("shop_size", { length: 100 }),
  category: varchar("category", { length: 100 }),
  status: occupancyStatusEnum("status").notNull().default("vacant"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  brandName: varchar("brand_name", { length: 255 }),
  shopId: integer("shop_id").references(() => shops.id, { onDelete: "set null" }),
  leaseStartDate: date("lease_start_date"),
  leaseEndDate: date("lease_end_date"),
  monthlyRent: decimal("monthly_rent", { precision: 12, scale: 2 }).default("0"),
  securityDeposit: decimal("security_deposit", { precision: 12, scale: 2 }).default("0"),
  agreementDocument: text("agreement_document"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  dueDate: date("due_date").notNull(),
  paymentDate: date("payment_date"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  proofUrl: text("proof_url"),
  proofType: varchar("proof_type", { length: 50 }),
  rejectionReason: text("rejection_reason"),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  type: notificationTypeEnum("type").notNull().default("general"),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
