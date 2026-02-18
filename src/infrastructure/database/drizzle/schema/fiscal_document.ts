import {
  decimal,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { customers } from "./customer";
import { products } from "./products";
import { discountTypeEnum, paymentMethodEnum } from "./sale";
import { warehouses } from "./warehouse";

export const fiscalDocumentTypeEnum = pgEnum("fiscal_document_type", ["input", "output"]);

export const fiscalDocumentModelEnum = pgEnum("fiscal_document_model", ["nfe", "nfce", "nfs"]);

export const fiscalDocumentStatusEnum = pgEnum("fiscal_document_status", [
  "draft",
  "issued",
  "cancelled",
  "denied",
]);

export const icmsCstEnum = pgEnum("icms_cst", [
  "00",
  "10",
  "20",
  "30",
  "40",
  "41",
  "50",
  "51",
  "60",
  "70",
  "90",
  "101",
  "102",
  "103",
  "201",
  "202",
  "203",
  "300",
  "400",
  "401",
  "500",
  "600",
  "700",
  "900",
]);

export const icmsOriginEnum = pgEnum("icms_origin", ["0", "1", "2", "3", "4", "5", "6", "7", "8"]);

export const pisCstEnum = pgEnum("pis_cst", [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "49",
  "50",
  "99",
]);

export const cofinsCstEnum = pgEnum("cofins_cst", [
  "01",
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "49",
  "50",
  "99",
]);

export const ipiCstEnum = pgEnum("ipi_cst", ["00", "01", "02", "03", "04", "99"]);

export const fiscalDocuments = pgTable("fiscal_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: fiscalDocumentTypeEnum("type").notNull(),
  model: fiscalDocumentModelEnum("model").notNull(),
  series: integer("series").notNull(),
  number: integer("number").notNull(),
  accessKey: varchar("access_key", { length: 60 }),
  status: fiscalDocumentStatusEnum("status").notNull().default("draft"),

  issueDate: timestamp("issue_date").notNull().defaultNow(),
  entryDate: timestamp("entry_date"),

  customerId: uuid("customer_id").references(() => customers.id),
  customerName: varchar("customer_name", { length: 200 }),
  customerDocument: varchar("customer_document", { length: 20 }),

  supplierName: varchar("supplier_name", { length: 200 }),
  supplierDocument: varchar("supplier_document", { length: 20 }),
  supplierState: varchar("supplier_state", { length: 2 }),

  saleId: uuid("sale_id"),
  warehouseId: uuid("warehouse_id")
    .notNull()
    .references(() => warehouses.id),

  discountType: discountTypeEnum("discount_type").notNull().default("fixed"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull().default("0"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  totalDiscount: decimal("total_discount", { precision: 10, scale: 2 }),
  totalTax: decimal("total_tax", { precision: 12, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),

  paymentMethod: paymentMethodEnum("payment_method"),
  notes: text("notes"),
  cancellationReason: text("cancellation_reason"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const fiscalDocumentItems = pgTable("fiscal_document_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  fiscalDocumentId: uuid("fiscal_document_id")
    .notNull()
    .references(() => fiscalDocuments.id, { onDelete: "cascade" }),
  productId: uuid("product_id").references(() => products.id),
  productName: varchar("product_name", { length: 200 }).notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 3 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),

  discountType: discountTypeEnum("discount_type").notNull().default("fixed"),
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull().default("0"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }),
  total: decimal("total", { precision: 12, scale: 2 }).notNull(),

  icmsBase: decimal("icms_base", { precision: 12, scale: 2 }),
  icmsRate: decimal("icms_rate", { precision: 5, scale: 2 }),
  icmsValue: decimal("icms_value", { precision: 12, scale: 2 }),
  icmsCst: icmsCstEnum("icms_cst"),
  icmsOrigin: icmsOriginEnum("icms_origin"),

  pisBase: decimal("pis_base", { precision: 12, scale: 2 }),
  pisRate: decimal("pis_rate", { precision: 5, scale: 2 }),
  pisValue: decimal("pis_value", { precision: 12, scale: 2 }),
  pisCst: pisCstEnum("pis_cst"),

  cofinsBase: decimal("cofins_base", { precision: 12, scale: 2 }),
  cofinsRate: decimal("cofins_rate", { precision: 5, scale: 2 }),
  cofinsValue: decimal("cofins_value", { precision: 12, scale: 2 }),
  cofinsCst: cofinsCstEnum("cofins_cst"),

  ipiBase: decimal("ipi_base", { precision: 12, scale: 2 }),
  ipiRate: decimal("ipi_rate", { precision: 5, scale: 2 }),
  ipiValue: decimal("ipi_value", { precision: 12, scale: 2 }),
  ipiCst: ipiCstEnum("ipi_cst"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type FiscalDocumentDB = typeof fiscalDocuments.$inferSelect;
export type FiscalDocumentInsert = typeof fiscalDocuments.$inferInsert;

export type FiscalDocumentItemDB = typeof fiscalDocumentItems.$inferSelect;
export type FiscalDocumentItemInsert = typeof fiscalDocumentItems.$inferInsert;
