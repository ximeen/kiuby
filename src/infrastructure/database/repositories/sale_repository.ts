import { Money } from "@domain/entities/product/value_objects/money";
import { type PaymentMethod, Sale, type SaleStatus } from "@domain/entities/sale/sale_entity";
import { SaleItem } from "@domain/entities/sale/sale_item_entity";
import type { ISaleRepository, SaleFilters } from "@domain/entities/sale/sale_repository";
import { Discount, DiscountType } from "@domain/entities/sale/value_objects/discount";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../drizzle/client";
import { saleItems, sales } from "../drizzle/schema";

export class DrizzleSaleRepository implements ISaleRepository {
  async save(sale: Sale): Promise<void> {
    const subtotal = sale.getSubtotal();
    const totalDiscount = sale.getItemsDiscount() + sale.getSaleDiscountAmount();
    const total = sale.getTotal();

    await db.insert(sales).values({
      id: sale.id,
      customerId: sale.customerId,
      customerName: sale.customerName,
      status: sale.status,
      discountType: sale.discount.type,
      discountValue: sale.discount.value.toString(),
      subtotal: subtotal.amount.toString(),
      totalDiscount: totalDiscount.toString(),
      total: total.amount.toString(),
      paymentMethod: sale.paymentMethod,
      createdBy: sale.createdBy,
      approvedBy: sale.approvedBy,
      approvedAt: sale.approvedAt,
      rejectedBy: sale.rejectedBy,
      rejectedAt: sale.rejectedAt,
      rejectionReason: sale.rejectionReason,
      notes: sale.notes,
    });
  }

  async saveItems(saleId: string, items: SaleItem[]): Promise<void> {
    await db.delete(saleItems).where(eq(saleItems.saleId, saleId));

    if (items.length > 0) {
      await db.insert(saleItems).values(
        items.map((i) => ({
          id: i.id,
          saleId,
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity.value.toString(),
          unitPrice: i.unitPrice.amount.toString(),
          discountType: i.discount.type,
          discountValue: i.discount.value.toString(),
          subtotal: i.getSubtotal().amount.toString(),
          discountAmount: i.getDiscountAmount().toString(),
          total: i.getTotal().amount.toString(),
        })),
      );
    }
  }

  async findById(id: string): Promise<Sale | null> {
    const [saleRow] = await db.select().from(sales).where(eq(sales.id, id)).limit(1);

    if (!saleRow) return null;

    const itemsRows = await db.select().from(saleItems).where(eq(saleItems.saleId, id));

    return this.toDomain(saleRow, itemsRows);
  }

  async findByCustomer(customerId: string, filters?: SaleFilters): Promise<Sale[]> {
    const conditions = [eq(sales.customerId, customerId)];

    if (filters?.status) {
      conditions.push(eq(sales.status, filters.status as any));
    }

    if (filters?.startDate) {
      conditions.push(gte(sales.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(sales.createdAt, filters.endDate));
    }

    if (filters?.createdBy) {
      conditions.push(eq(sales.createdBy, filters.createdBy));
    }

    if (filters?.minTotal !== undefined) {
      conditions.push(gte(sales.total, filters.minTotal.toString()));
    }

    if (filters?.maxTotal !== undefined) {
      conditions.push(lte(sales.total, filters.maxTotal.toString()));
    }

    const salesRows = await db
      .select()
      .from(sales)
      .where(and(...conditions));

    return Promise.all(
      salesRows.map(async (s) => {
        const itemsRow = await db.select().from(saleItems).where(eq(saleItems.saleId, s.id));

        return this.toDomain(s, itemsRow);
      }),
    );
  }

  async findAll(filters?: SaleFilters): Promise<Sale[]> {
    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(sales.status, filters.status as any));
    }
    if (filters?.startDate) {
      conditions.push(gte(sales.createdAt, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(sales.createdAt, filters.endDate));
    }
    if (filters?.createdBy) {
      conditions.push(eq(sales.createdBy, filters.createdBy));
    }
    if (filters?.minTotal !== undefined) {
      conditions.push(gte(sales.total, filters.minTotal.toString()));
    }
    if (filters?.maxTotal !== undefined) {
      conditions.push(lte(sales.total, filters.maxTotal.toString()));
    }

    let query = db.select().from(sales);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const salesRows = await query;

    return Promise.all(
      salesRows.map(async (saleRow) => {
        const itemsRows = await db.select().from(saleItems).where(eq(saleItems.saleId, saleRow.id));

        return this.toDomain(saleRow, itemsRows);
      }),
    );
  }

  async findPendingAproval(): Promise<Sale[]> {
    const salesRows = await db.select().from(sales).where(eq(sales.status, "pending"));

    return Promise.all(
      salesRows.map(async (saleRow) => {
        const itemsRows = await db.select().from(saleItems).where(eq(saleItems.saleId, saleRow.id));

        return this.toDomain(saleRow, itemsRows);
      }),
    );
  }

  async update(sale: Sale): Promise<void> {
    const subtotal = sale.getSubtotal();
    const totalDiscount = sale.getItemsDiscount() + sale.getSaleDiscountAmount();
    const total = sale.getTotal();

    await db
      .update(sales)
      .set({
        status: sale.status,
        discountType: sale.discount.type,
        discountValue: sale.discount.value.toString(),
        subtotal: subtotal.amount.toString(),
        totalDiscount: totalDiscount.toString(),
        total: total.amount.toString(),
        paymentMethod: sale.paymentMethod,
        approvedBy: sale.approvedBy,
        approvedAt: sale.approvedAt,
        rejectedBy: sale.rejectedBy,
        rejectedAt: sale.rejectedAt,
        rejectionReason: sale.rejectionReason,
        notes: sale.notes,
        updatedAt: new Date(),
      })
      .where(eq(sales.id, sale.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(saleItems).where(eq(saleItems.saleId, id));
    await db.delete(sales).where(eq(sales.id, id));
  }

  private toDomain(saleRow: any, itemsRows: any[]): Sale {
    const discount =
      saleRow.discountType === DiscountType.PERCENTAGE
        ? Discount.createPercentage(parseFloat(saleRow.discountValue))
        : Discount.createFixed(parseFloat(saleRow.discountValue));

    const items = itemsRows.map((itemRow) => {
      const itemDiscount =
        itemRow.discountType === DiscountType.PERCENTAGE
          ? Discount.createPercentage(parseFloat(itemRow.discountValue))
          : Discount.createFixed(parseFloat(itemRow.discountValue));

      return SaleItem.create(
        {
          productId: itemRow.productId,
          productName: itemRow.productName,
          quantity: Quantity.create(parseFloat(itemRow.quantity)),
          unitPrice: Money.create(parseFloat(itemRow.unitPrice)),
          discount: itemDiscount,
        },
        itemRow.id,
      );
    });

    return Sale.create(
      {
        customerId: saleRow.customerId,
        customerName: saleRow.customerName,
        status: saleRow.status as SaleStatus,
        discount,
        items,
        paymentMethod: saleRow.paymentMethod as PaymentMethod | undefined,
        createdBy: saleRow.createdBy,
        approvedBy: saleRow.approvedBy,
        approvedAt: saleRow.approvedAt,
        rejectedBy: saleRow.rejectedBy,
        rejectedAt: saleRow.rejectedAt,
        rejectionReason: saleRow.rejectionReason,
        notes: saleRow.notes,
      },
      saleRow.id,
    );
  }
}
