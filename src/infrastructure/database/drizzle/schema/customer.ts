import {
  date,
  decimal,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const customerTypeEnum = pgEnum("customer_type", ["individual", "company"]);
export const customerStatusEnum = pgEnum("customer_status", ["active", "inactive", "blocked"]);
export const documentTypeEnum = pgEnum("document_type", ["cpf", "cnpj"]);

export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  email: varchar("email", { length: 200 }),
  phone: varchar("phone", { length: 20 }),
  document: varchar("document", { length: 20 }),
  documentType: documentTypeEnum("document_type"),
  type: customerTypeEnum("type").notNull(),
  status: customerStatusEnum("status").notNull().default("active"),
  birthdate: date("birthdate"),
  companyName: varchar("company_name", { length: 200 }),
  notes: text("notes"),
  creditLimit: decimal("credit_limit", { precision: 10, scale: 2 }),
  currentDebt: decimal("current_debt", { precision: 10, scale: 2 }).notNull().default("0"),

  street: varchar("street", { length: 200 }),
  number: varchar("number", { length: 20 }),
  complement: varchar("complement", { length: 100 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zip_code", { length: 8 }),
  country: varchar("country", { length: 2 }).default("BR"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CustomerDB = typeof customers.$inferSelect;
export type CustomerInsert = typeof customers.$inferInsert;
