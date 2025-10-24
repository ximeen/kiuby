import { decimal, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { customers } from "./customer";
import { products } from "./products";

export const saleStatusEnum = pgEnum("sale_status", [
  "draft",
  "pending",
  "approved",
  "rejected",
  "processing",
  "completed",
  "cancelled",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "credit_card",
  "debit_card",
  "pix",
  "bank_slip",
  "credit",
]);

export const discountTypeEnum = pgEnum("discount_type", ["percentage", "fixed"]);

export const sales = pgTable("sales", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .notNull()
    .references(() => customers.id),
  customerName: varchar("customer_name", { length: 200 }).notNull(),
  status: saleStatusEnum("status").notNull().default("draft"),

  discountType: discountTypeEnum("discount_type").notNull().default("fixed"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull().default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  totalDiscount: decimal("total_discount", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),

  paymentMethod: paymentMethodEnum("payment_method"),

  createdBy: uuid("created_by").notNull(),
  approvedBy: uuid("approved_by"),
  approvedAt: timestamp("approved_at"),
  rejectedBy: uuid("rejected_by"),
  rejectedAt: timestamp("rejected_at"),
  rejectedReason: text("rejected_reason"),
  notes: text("notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const saleItems = pgTable("sale_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  saleId: uuid("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id),
  productName: varchar("product_name", { length: 200 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),

  discountType: discountTypeEnum("discount_type").notNull().default("fixed"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull().default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SaleDB = typeof sales.$inferSelect;
export type SaleInsert = typeof sales.$inferInsert;

export type SaleItemDB = typeof saleItems.$inferSelect;
export type SaleItemInsert = typeof saleItems.$inferInsert;
