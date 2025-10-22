import { decimal, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const productStatusEnum = pgEnum("product_status", ["active", "inactive", "discontinued"]);

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  sku: varchar("sku", { length: 50 }).notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  costPrice: decimal("cost_price", { precision: 10, scale: 2 }),
  status: productStatusEnum("status").notNull().default("active"),
  categoryId: uuid("category_id"),
  minStockLevel: decimal("min_stock_level", { precision: 10, scale: 2 }).notNull().default("0"),
  maxStockLevel: decimal("max_stock_level", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 10 }).notNull().default("UN"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type ProductDB = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;
