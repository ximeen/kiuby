import {
  MovementReason,
  MovementType,
  StockMovement,
} from "@domain/entities/stock/stock_movement.entity";
import type {
  IStockMovementRepository,
  IStockRepository,
} from "@domain/entities/stock/stock_repository";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { NotFoundError } from "@shared/errors/domain_error";

interface AdjustStockInput {
  productId: string;
  warehouseId: string;
  newQuantity: number;
  userId: string;
  notes?: string;
}

export class AdjustStockUseCase {
  constructor(
    private stockRepo: IStockRepository,
    private movementRepo: IStockMovementRepository,
  ) {}

  async execute(input: AdjustStockInput): Promise<void> {
    const newQuantity = Quantity.create(input.newQuantity);

    const stock = await this.stockRepo.findByProductAndWarehouse(
      input.productId,
      input.warehouseId,
    );
    if (!stock) {
      throw new NotFoundError("Stock", `${input.productId}/${input.warehouseId}`);
    }

    const previousQuantity = stock.quantity;
    const difference = newQuantity.value - previousQuantity.value;
    const adjustmentQty = Quantity.create(Math.abs(difference));
    const movementType = difference > 0 ? MovementType.ENTRY : MovementType.EXIT;

    if (difference > 0) {
      stock.addQuantity(adjustmentQty);
    }

    if (difference < 0) {
      stock.removeQuantity(adjustmentQty);
    }

    await this.stockRepo.update(stock);

    const movement = StockMovement.create({
      productId: input.productId,
      stockId: stock.id,
      type: movementType,
      reason: MovementReason.MANUAL_ADJUSTMENT,
      quantity: adjustmentQty,
      previousQuantity,
      newQuantity: stock.quantity,
      userId: input.userId,
      notes: input.notes || `Ajuste de estoque: ${previousQuantity.value} → ${newQuantity.value}`,
    });

    await this.movementRepo.save(movement);
  }
}
