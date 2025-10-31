import { Stock, type StockStatus } from "@domain/entities/stock/stock_entity";
import type { IStockRepository } from "@domain/entities/stock/stock_repository";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { and, eq } from "drizzle-orm";
import { db } from "../drizzle/client";
import { stocks } from "../drizzle/schema";

export class DrizzleStockRepository implements IStockRepository {
  async save(stock: Stock): Promise<void> {
    await db.insert(stocks).values({
      id: stock.id,
      productId: stock.productId,
      warehouseId: stock.warehouseId,
      quantity: stock.quantity.value.toString(),
      reservedQuantity: stock.reservedQuantity.value.toString(),
      status: stock.status,
      lastMovementAt: stock.lastMovementAt,
    });
  }

  async findById(id: string): Promise<Stock | null> {
    const result = await db.select().from(stocks).where(eq(stocks.id, id)).limit(1);

    if (result.length === 0) return null;

    return this.toDomain(result[0]);
  }

  async findByProductAndWarehouse(productId: string, warehouseId: string): Promise<Stock | null> {
    const result = await db
      .select()
      .from(stocks)
      .where(and(eq(stocks.productId, productId), eq(stocks.warehouseId, warehouseId)))
      .limit(1);

    if (result.length === 0) return null;

    return this.toDomain(result[0]);
  }

  async findByProduct(productId: string): Promise<Stock[]> {
    const result = await db.select().from(stocks).where(eq(stocks.productId, productId));

    return result.map((row) => this.toDomain(row));
  }

  async findByWarehouse(warehouseId: string): Promise<Stock[]> {
    const result = await db.select().from(stocks).where(eq(stocks.warehouseId, warehouseId));
    return result.map((row) => this.toDomain(row));
  }

  async update(stock: Stock): Promise<void> {
    await db
      .update(stocks)
      .set({
        quantity: stock.quantity.value.toString(),
        reservedQuantity: stock.reservedQuantity.value.toString(),
        status: stock.status,
        lastMovementAt: stock.lastMovementAt,
        updatedAt: new Date(),
      })
      .where(eq(stocks.id, stock.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(stocks).where(eq(stocks.id, id));
  }

  private toDomain(row: any): Stock {
    return Stock.create(
      {
        productId: row.productId,
        warehouseId: row.warehouseId,
        quantity: Quantity.create(parseFloat(row.quantity)),
        reservedQuantity: Quantity.create(parseFloat(row.reservedQuantity)),
        status: row.status as StockStatus,
        lastMovementAt: row.lastMovementAt,
      },
      row.id,
    );
  }
}
