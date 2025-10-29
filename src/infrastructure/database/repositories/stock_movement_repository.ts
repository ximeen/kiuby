import {
  type MovementReason,
  type MovementType,
  StockMovement,
} from "@domain/entities/stock/stock_movement.entity";
import type {
  IStockMovementRepository,
  MovementFilters,
} from "@domain/entities/stock/stock_repository";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "../drizzle/client";
import { stockMovements } from "../drizzle/schema";

export class DrizzleStockMovementRepository implements IStockMovementRepository {
  async save(movement: StockMovement): Promise<void> {
    await db.insert(stockMovements).values({
      productId: movement.productId,
      stockId: movement.stockId,
      type: movement.type,
      reason: movement.reason,
      quantity: movement.quantity.value.toString(),
      previousQuantity: movement.previousQuantity.value.toString(),
      newQuantity: movement.newQuantity.value.toString(),
      userId: movement.userId,
      notes: movement.notes,
      referenceId: movement.referenceId,
      referenceType: movement.referenceType,
    });
  }

  async findById(id: string): Promise<StockMovement | null> {
    const result = await db.select().from(stockMovements).where(eq(stockMovements.id, id)).limit(1);

    if (result.length === 0) return null;
    return this.toDomain(result[0]);
  }

  async findByStock(stockId: string, filters?: MovementFilters): Promise<StockMovement[]> {
    let query = db.select().from(stockMovements);

    const conditions = [eq(stockMovements.stockId, stockId)];

    if (filters?.startDate) {
      conditions.push(gte(stockMovements.createdAt, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(stockMovements.createdAt, filters.endDate));
    }
    if (filters?.type) {
      conditions.push(eq(stockMovements.type, filters.type as any));
    }

    if (filters?.reason) {
      conditions.push(eq(stockMovements.reason, filters.reason as any));
    }

    if (filters?.userId) {
      conditions.push(eq(stockMovements.userId, filters.userId));
    }
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    return result.map((row) => this.toDomain(row));
  }

  async findByProduct(productId: string, filters: MovementFilters): Promise<StockMovement[]> {
    const conditions = [eq(stockMovements.productId, productId)];

    if (filters.startDate) {
      conditions.push(gte(stockMovements.createdAt, filters.startDate));
    }
    if (filters.endDate) {
      conditions.push(lte(stockMovements.createdAt, filters.endDate));
    }
    if (filters?.type) {
      conditions.push(eq(stockMovements.type, filters.type as any));
    }

    if (filters?.reason) {
      conditions.push(eq(stockMovements.reason, filters.reason as any));
    }

    if (filters?.userId) {
      conditions.push(eq(stockMovements.userId, filters.userId));
    }

    const result = await db
      .select()
      .from(stockMovements)
      .where(and(...conditions));

    return result.map((row) => this.toDomain(row));
  }

  async findByReference(referenceId: string, referenceType: string): Promise<StockMovement[]> {
    const result = await db
      .select()
      .from(stockMovements)
      .where(
        and(
          eq(stockMovements.referenceId, referenceId),
          eq(stockMovements.referenceType, referenceType),
        ),
      );

    return result.map((row) => this.toDomain(row));
  }

  private toDomain(row: any): StockMovement {
    return StockMovement.create(
      {
        productId: row.productId,
        stockId: row.stockId,
        type: row.type as MovementType,
        reason: row.reason as MovementReason,
        quantity: Quantity.create(parseFloat(row.quantity)),
        previousQuantity: Quantity.create(parseFloat(row.previousQuantity)),
        newQuantity: Quantity.create(parseFloat(row.newQuantity)),
        userId: row.userId,
        notes: row.notes,
        referenceId: row.referenceId,
        referenceType: row.referenceType,
      },
      row.id,
    );
  }
}
