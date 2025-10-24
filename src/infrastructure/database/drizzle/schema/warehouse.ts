import { integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const warehouseTypeEnum = pgEnum("warehouse_type", [
  "main",
  "branch",
  "store",
  "distribution",
]);
export const warehouseStatusEnum = pgEnum("warehouse_status", [
  "active",
  "inactive",
  "maintenance",
]);

export const warehouses = pgTable("warehouses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  type: warehouseTypeEnum("type").notNull(),
  status: warehouseStatusEnum("status").notNull().default("active"),

  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 200 }),
  managerId: uuid("manager_id"),

  capacity: integer("capacity"),

  street: varchar("street", { length: 200 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zip_code", { length: 8 }),
  country: varchar("country", { length: 2 }).default("BR"),

  notes: text("notes"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type WarehouseDB = typeof warehouses.$inferSelect;
export type WarehouseInsert = typeof warehouses.$inferInsert;
