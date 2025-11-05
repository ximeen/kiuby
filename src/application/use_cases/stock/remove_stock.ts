import {
  type MovementReason,
  MovementType,
  StockMovement,
} from "@domain/entities/stock/stock_movement.entity";
import type {
  IStockMovementRepository,
  IStockRepository,
} from "@domain/entities/stock/stock_repository";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { NotFoundError } from "@shared/errors/domain_error";

interface RemoveStockInput {
  productId: string;
  warehouseId: string;
  quantity: number;
  userId: string;
  reason: MovementReason;
  notes?: string;
  referenceId?: string;
  referenceType?: string;
}

export class RemoveStockUseCase {
  constructor(
    private stockRepo: IStockRepository,
    private movementRepo: IStockMovementRepository,
  ) {}

  async execute(input: RemoveStockInput): Promise<void> {
    const quantity = Quantity.create(input.quantity);

    const stock = await this.stockRepo.findByProductAndWarehouse(
      input.productId,
      input.warehouseId,
    );

    if (!stock) {
      throw new NotFoundError("Stock", `${input.productId}/${input.warehouseId}`);
    }

    const previousQty = stock.quantity;

    stock.removeQuantity(quantity);
    await this.stockRepo.update(stock);

    const movement = StockMovement.create({
      productId: input.productId,
      stockId: stock.id,
      type: MovementType.EXIT,
      reason: input.reason,
      quantity,
      previousQuantity: previousQty,
      newQuantity: stock.quantity,
      userId: input.userId,
      notes: input.notes,
      referenceId: input.referenceId,
      referenceType: input.referenceType,
    });

    await this.movementRepo.save(movement);
  }
}
