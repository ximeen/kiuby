import { FiscalDocument } from "@domain/entities/fiscal_document/fiscal_document_entity";
import { FiscalDocumentItem } from "@domain/entities/fiscal_document/fiscal_document_item_entity";
import type {
  FiscalDocumentFilters,
  IFiscalDocumentRepository,
} from "@domain/entities/fiscal_document/fiscal_document_repository";
import {
  type FiscalDocumentStatus,
  FiscalDocumentStatusVO,
} from "@domain/entities/fiscal_document/value_objects/fiscal_document_status";
import {
  type FiscalDocumentModel,
  type FiscalDocumentType,
  FiscalDocumentTypeVO,
} from "@domain/entities/fiscal_document/value_objects/fiscal_document_type";
import {
  type CofinsCst,
  type IcmsCst,
  type IcmsOrigin,
  type IpiCst,
  type PisCst,
  TaxImpost,
} from "@domain/entities/fiscal_document/value_objects/tax_impost";
import { Money } from "@domain/entities/product/value_objects/money";
import type { PaymentMethod } from "@domain/entities/sale/sale_entity";
import { Discount, DiscountType } from "@domain/entities/sale/value_objects/discount";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../drizzle/client";
import { fiscalDocumentItems, fiscalDocuments } from "../drizzle/schema";

export class DrizzleFiscalDocumentRepository implements IFiscalDocumentRepository {
  async save(doc: FiscalDocument): Promise<void> {
    const subtotal = doc.getSubtotal();
    const itemsDiscount = doc.getItemsDiscount();
    const documentDiscount = doc.discount.apply(subtotal.amount - itemsDiscount);
    const totalTax = doc.getTotalTax();
    const total = doc.getTotal();

    await db.insert(fiscalDocuments).values({
      id: doc.id,
      type: doc.type.type,
      model: doc.type.model,
      series: doc.series,
      number: doc.number,
      accessKey: doc.accessKey,
      status: doc.status.status,
      issueDate: doc.issueDate,
      entryDate: doc.entryDate,
      customerId: doc.customerId,
      customerName: doc.customerName,
      customerDocument: doc.customerDocument,
      supplierName: doc.supplierName,
      supplierDocument: doc.supplierDocument,
      supplierState: doc.supplierState,
      saleId: doc.saleId,
      warehouseId: doc.warehouseId,
      discountType: doc.discount.type,
      discountValue: doc.discount.value.toString(),
      subtotal: subtotal.amount.toString(),
      totalDiscount: (itemsDiscount + documentDiscount).toString(),
      totalTax: totalTax.amount.toString(),
      total: total.amount.toString(),
      paymentMethod: doc.paymentMethod,
      notes: doc.notes,
      cancellationReason: doc.cancellationReason,
    });
  }

  async saveItems(docId: string, items: FiscalDocumentItem[]): Promise<void> {
    await db.delete(fiscalDocumentItems).where(eq(fiscalDocumentItems.fiscalDocumentId, docId));

    if (items.length > 0) {
      await db.insert(fiscalDocumentItems).values(
        items.map((i) => ({
          id: i.id,
          fiscalDocumentId: docId,
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity.value.toString(),
          unitPrice: i.unitPrice.amount.toString(),
          discountType: i.discount.type,
          discountValue: i.discount.value.toString(),
          subtotal: i.getSubtotal().amount.toString(),
          discountAmount: i.getDiscountAmount().toString(),
          total: i.getTotal().amount.toString(),
          icmsBase: i.icms.base.amount.toString(),
          icmsRate: i.icms.rate.toString(),
          icmsValue: i.icms.value.amount.toString(),
          icmsCst: i.icmsCst,
          icmsOrigin: i.icmsOrigin.toString() as
            | "0"
            | "1"
            | "2"
            | "3"
            | "4"
            | "5"
            | "6"
            | "7"
            | "8",
          pisBase: i.pis.base.amount.toString(),
          pisRate: i.pis.rate.toString(),
          pisValue: i.pis.value.amount.toString(),
          pisCst: i.pisCst,
          cofinsBase: i.cofins.base.amount.toString(),
          cofinsRate: i.cofins.rate.toString(),
          cofinsValue: i.cofins.value.amount.toString(),
          cofinsCst: i.cofinsCst,
          ipiBase: i.ipi.base.amount.toString(),
          ipiRate: i.ipi.rate.toString(),
          ipiValue: i.ipi.value.amount.toString(),
          ipiCst: i.ipiCst,
        })),
      );
    }
  }

  async findById(id: string): Promise<FiscalDocument | null> {
    const [docRow] = await db
      .select()
      .from(fiscalDocuments)
      .where(eq(fiscalDocuments.id, id))
      .limit(1);

    if (!docRow) return null;

    const itemsRows = await db
      .select()
      .from(fiscalDocumentItems)
      .where(eq(fiscalDocumentItems.fiscalDocumentId, id));

    return this.toDomain(docRow, itemsRows);
  }

  async findByAccessKey(accessKey: string): Promise<FiscalDocument | null> {
    const [docRow] = await db
      .select()
      .from(fiscalDocuments)
      .where(eq(fiscalDocuments.accessKey, accessKey))
      .limit(1);

    if (!docRow) return null;

    const itemsRows = await db
      .select()
      .from(fiscalDocumentItems)
      .where(eq(fiscalDocumentItems.fiscalDocumentId, docRow.id));

    return this.toDomain(docRow, itemsRows);
  }

  async findBySale(saleId: string): Promise<FiscalDocument | null> {
    const [docRow] = await db
      .select()
      .from(fiscalDocuments)
      .where(eq(fiscalDocuments.saleId, saleId))
      .limit(1);

    if (!docRow) return null;

    const itemsRows = await db
      .select()
      .from(fiscalDocumentItems)
      .where(eq(fiscalDocumentItems.fiscalDocumentId, docRow.id));

    return this.toDomain(docRow, itemsRows);
  }

  async findByCustomer(
    customerId: string,
    filters?: FiscalDocumentFilters,
  ): Promise<FiscalDocument[]> {
    const conditions = [eq(fiscalDocuments.customerId, customerId)];

    this.applyFilters(conditions, filters);

    const docRows = await db
      .select()
      .from(fiscalDocuments)
      .where(and(...conditions));

    return Promise.all(
      docRows.map(async (docRow) => {
        const itemsRows = await db
          .select()
          .from(fiscalDocumentItems)
          .where(eq(fiscalDocumentItems.fiscalDocumentId, docRow.id));

        return this.toDomain(docRow, itemsRows);
      }),
    );
  }

  async findBySupplier(
    supplierDocument: string,
    filters?: FiscalDocumentFilters,
  ): Promise<FiscalDocument[]> {
    const conditions = [eq(fiscalDocuments.supplierDocument, supplierDocument)];

    this.applyFilters(conditions, filters);

    const docRows = await db
      .select()
      .from(fiscalDocuments)
      .where(and(...conditions));

    return Promise.all(
      docRows.map(async (docRow) => {
        const itemsRows = await db
          .select()
          .from(fiscalDocumentItems)
          .where(eq(fiscalDocumentItems.fiscalDocumentId, docRow.id));

        return this.toDomain(docRow, itemsRows);
      }),
    );
  }

  async findAll(filters?: FiscalDocumentFilters): Promise<FiscalDocument[]> {
    const conditions: any[] = [];

    this.applyFilters(conditions, filters);

    let query = db.select().from(fiscalDocuments);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const docRows = await query;

    return Promise.all(
      docRows.map(async (docRow) => {
        const itemsRows = await db
          .select()
          .from(fiscalDocumentItems)
          .where(eq(fiscalDocumentItems.fiscalDocumentId, docRow.id));

        return this.toDomain(docRow, itemsRows);
      }),
    );
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: FiscalDocumentFilters,
  ): Promise<FiscalDocument[]> {
    const conditions = [
      gte(fiscalDocuments.issueDate, startDate),
      lte(fiscalDocuments.issueDate, endDate),
    ];

    this.applyFilters(conditions, filters);

    const docRows = await db
      .select()
      .from(fiscalDocuments)
      .where(and(...conditions));

    return Promise.all(
      docRows.map(async (docRow) => {
        const itemsRows = await db
          .select()
          .from(fiscalDocumentItems)
          .where(eq(fiscalDocumentItems.fiscalDocumentId, docRow.id));

        return this.toDomain(docRow, itemsRows);
      }),
    );
  }

  async update(doc: FiscalDocument): Promise<void> {
    const subtotal = doc.getSubtotal();
    const itemsDiscount = doc.getItemsDiscount();
    const documentDiscount = doc.discount.apply(subtotal.amount - itemsDiscount);
    const totalTax = doc.getTotalTax();
    const total = doc.getTotal();

    await db
      .update(fiscalDocuments)
      .set({
        type: doc.type.type,
        model: doc.type.model,
        series: doc.series,
        number: doc.number,
        accessKey: doc.accessKey,
        status: doc.status.status,
        issueDate: doc.issueDate,
        entryDate: doc.entryDate,
        customerId: doc.customerId,
        customerName: doc.customerName,
        customerDocument: doc.customerDocument,
        supplierName: doc.supplierName,
        supplierDocument: doc.supplierDocument,
        supplierState: doc.supplierState,
        saleId: doc.saleId,
        warehouseId: doc.warehouseId,
        discountType: doc.discount.type,
        discountValue: doc.discount.value.toString(),
        subtotal: subtotal.amount.toString(),
        totalDiscount: (itemsDiscount + documentDiscount).toString(),
        totalTax: totalTax.amount.toString(),
        total: total.amount.toString(),
        paymentMethod: doc.paymentMethod,
        notes: doc.notes,
        cancellationReason: doc.cancellationReason,
        updatedAt: new Date(),
      })
      .where(eq(fiscalDocuments.id, doc.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(fiscalDocumentItems).where(eq(fiscalDocumentItems.fiscalDocumentId, id));
    await db.delete(fiscalDocuments).where(eq(fiscalDocuments.id, id));
  }

  private applyFilters(conditions: any[], filters?: FiscalDocumentFilters): void {
    if (!filters) return;

    if (filters.type) {
      conditions.push(eq(fiscalDocuments.type, filters.type as "input" | "output"));
    }
    if (filters.model) {
      conditions.push(eq(fiscalDocuments.model, filters.model as "nfe" | "nfce" | "nfs"));
    }
    if (filters.status) {
      conditions.push(
        eq(fiscalDocuments.status, filters.status as "draft" | "issued" | "cancelled" | "denied"),
      );
    }
    if (filters.series) {
      conditions.push(eq(fiscalDocuments.series, filters.series));
    }
    if (filters.number) {
      conditions.push(eq(fiscalDocuments.number, filters.number));
    }
    if (filters.warehouseId) {
      conditions.push(eq(fiscalDocuments.warehouseId, filters.warehouseId));
    }
    if (filters.paymentMethod) {
      conditions.push(eq(fiscalDocuments.paymentMethod, filters.paymentMethod as PaymentMethod));
    }
    if (filters.minTotal !== undefined) {
      conditions.push(gte(fiscalDocuments.total, filters.minTotal.toString()));
    }
    if (filters.maxTotal !== undefined) {
      conditions.push(lte(fiscalDocuments.total, filters.maxTotal.toString()));
    }
  }

  private toDomain(docRow: any, itemsRows: any[]): FiscalDocument {
    const type = FiscalDocumentTypeVO.create(
      docRow.type as FiscalDocumentType,
      docRow.model as FiscalDocumentModel,
    );

    const status = FiscalDocumentStatusVO.create(docRow.status as FiscalDocumentStatus);

    const discount =
      docRow.discountType === DiscountType.PERCENTAGE
        ? Discount.createPercentage(parseFloat(docRow.discountValue))
        : Discount.createFixed(parseFloat(docRow.discountValue));

    const items = itemsRows.map((itemRow) => {
      const itemDiscount =
        itemRow.discountType === DiscountType.PERCENTAGE
          ? Discount.createPercentage(parseFloat(itemRow.discountValue))
          : Discount.createFixed(parseFloat(itemRow.discountValue));

      const icms = TaxImpost.createIcms(
        Money.create(parseFloat(itemRow.icmsBase || "0")),
        parseFloat(itemRow.icmsRate || "0"),
        itemRow.icmsCst as IcmsCst,
        parseInt(itemRow.icmsOrigin || "0", 10) as IcmsOrigin,
      );

      const pis = TaxImpost.createPis(
        Money.create(parseFloat(itemRow.pisBase || "0")),
        parseFloat(itemRow.pisRate || "0"),
        itemRow.pisCst as PisCst,
      );

      const cofins = TaxImpost.createCofins(
        Money.create(parseFloat(itemRow.cofinsBase || "0")),
        parseFloat(itemRow.cofinsRate || "0"),
        itemRow.cofinsCst as CofinsCst,
      );

      const ipi = TaxImpost.createIpi(
        Money.create(parseFloat(itemRow.ipiBase || "0")),
        parseFloat(itemRow.ipiRate || "0"),
        itemRow.ipiCst as IpiCst,
      );

      return FiscalDocumentItem.create(
        {
          productId: itemRow.productId,
          productName: itemRow.productName,
          quantity: Quantity.create(parseFloat(itemRow.quantity)),
          unitPrice: Money.create(parseFloat(itemRow.unitPrice)),
          discount: itemDiscount,
          icms,
          pis,
          cofins,
          ipi,
          icmsCst: itemRow.icmsCst as IcmsCst,
          icmsOrigin: parseInt(itemRow.icmsOrigin || "0", 10) as IcmsOrigin,
          pisCst: itemRow.pisCst as PisCst,
          cofinsCst: itemRow.cofinsCst as CofinsCst,
          ipiCst: itemRow.ipiCst as IpiCst,
        },
        itemRow.id,
      );
    });

    return FiscalDocument.create(
      {
        type,
        series: docRow.series,
        number: docRow.number,
        warehouseId: docRow.warehouseId,
        status,
        issueDate: docRow.issueDate,
        entryDate: docRow.entryDate,
        customerId: docRow.customerId,
        customerName: docRow.customerName,
        customerDocument: docRow.customerDocument,
        supplierName: docRow.supplierName,
        supplierDocument: docRow.supplierDocument,
        supplierState: docRow.supplierState,
        saleId: docRow.saleId,
        paymentMethod: docRow.paymentMethod as PaymentMethod | undefined,
        discount,
        items,
        notes: docRow.notes,
      },
      docRow.id,
    );
  }
}
