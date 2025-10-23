import { decimal, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { products } from "./products";

export const stockStatusEnum = pgEnum("stock_status", ["active", "inactive", "blocked"]);

export const stocks = pgTable("stocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  warehouseId: uuid("warehouse_id").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("0"),
  reservedQuantity: decimal("reserved_quantity", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  status: stockStatusEnum("status").notNull().default("active"),
  lastMovementAt: timestamp("last_movement_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const movementTypeEnum = pgEnum("movement_type", [
  "entry",
  "exit",
  "adjustment",
  "transfer",
  "return",
  "loss",
]);

export const movementReasonEnum = pgEnum("movement_reason", [
  "purchase",
  "sale",
  "manual",
  "transfer_out",
  "transfer_id",
  "return",
  "damaged",
  "expired",
  "inventory",
]);

export const stockMovements = pgTable("stock_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  stockId: uuid("stock_id")
    .notNull()
    .references(() => stocks.id, { onDelete: "cascade" }),
  type: movementTypeEnum("type").notNull(),
  reason: movementReasonEnum("reason").notNull(),
  quantiy: decimal("quantiy", { precision: 10, scale: 2 }).notNull(),
  previousQuantity: decimal("previous_quantity", { precision: 10, scale: 2 }).notNull(),
  newQuantity: decimal("new_quantity", { precision: 10, scale: 2 }).notNull(),
  userId: uuid("user_id").notNull(),
  notes: text("notes"),
  referenceId: uuid("reference_id"),
  referenceType: varchar("reference_type", { length: 50 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type StockDB = typeof stocks.$inferSelect;
export type StockInsert = typeof stocks.$inferInsert;

export type StockMovementDB = typeof stockMovements.$inferSelect;
export type StockMovementInsert = typeof stockMovements.$inferInsert;
