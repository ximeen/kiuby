import type { StockMovement } from "@domain/entities/stock/stock_movement.entity";
import type {
  IStockMovementRepository,
  MovementFilters,
} from "@domain/entities/stock/stock_repository";

interface GetStockMovementInput {
  productId?: string;
  stockId?: string;
  startDate?: Date;
  endDate?: Date;
  type?: string;
  reason?: string;
  userId?: string;
}

interface StockMovementItem {
  id: string;
  productId: string;
  stockId: string;
  type: string;
  reason: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  userId: string;
  notes?: string;
  referenceId?: string;
  referenceType?: string;
  createdAt: Date;
}

export class GetStockMovementsUseCase {
  constructor(private movementRepo: IStockMovementRepository) {}

  async execute(input: GetStockMovementInput): Promise<StockMovementItem[]> {
    const filters: MovementFilters = {
      startDate: input.startDate,
      endDate: input.endDate,
      type: input.type,
      reason: input.reason,
      userId: input.userId,
    };

    let movements: StockMovement[];

    if (input.stockId) {
      movements = await this.movementRepo.findByStock(input.stockId, filters);
    } else if (input.productId) {
      movements = await this.movementRepo.findByProduct(input.productId, filters);
    } else {
      throw new Error("Either productId or stockId must be provider");
    }

    return movements.map((movement) => ({
      id: movement.id,
      productId: movement.productId,
      stockId: movement.stockId,
      type: movement.type,
      reason: movement.reason,
      quantity: movement.quantity.value,
      previousQuantity: movement.previousQuantity.value,
      newQuantity: movement.newQuantity.value,
      userId: movement.userId,
      notes: movement.notes,
      referenceId: movement.referenceId,
      referenceType: movement.referenceType,
      createdAt: movement.createdAt,
    }));
  }
}
