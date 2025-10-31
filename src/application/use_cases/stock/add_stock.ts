import { Stock } from "@domain/entities/stock/stock_entity";
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

interface AddStockInput {
  productId: string;
  warehouseId: string;
  quantity: number;
  userId: string;
  reason: MovementReason;
  notes?: string;
  referenceId?: string;
  referenceType?: string;
}

export class AddStockUseCase {
  constructor(
    private stockRepo: IStockRepository,
    private movementRepo: IStockMovementRepository,
  ) {}

  async execute(input: AddStockInput): Promise<void> {
    const quantity = Quantity.create(input.quantity);

    let stock = await this.stockRepo.findByProductAndWarehouse(input.productId, input.warehouseId);

    if (!stock) {
      stock = Stock.create({
        productId: input.productId,
        warehouseId: input.warehouseId,
        quantity: Quantity.zero(),
      });

      await this.stockRepo.save(stock);
    }

    const previousQuantity = stock.quantity;

    stock.addQuantity(quantity);
    await this.stockRepo.update(stock);

    const movement = StockMovement.create({
      productId: input.productId,
      stockId: stock.id,
      type: MovementType.ENTRY,
      reason: input.reason,
      quantity,
      previousQuantity,
      newQuantity: stock.quantity,
      userId: input.userId,
      notes: input.notes,
      referenceId: input.referenceId,
      referenceType: input.referenceType,
    });

    await this.movementRepo.save(movement);
  }
}
