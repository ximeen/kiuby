import type { IStockRepository } from "@domain/entities/stock/stock_repository";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { NotFoundError } from "@shared/errors/domain_error";

interface ReserveStockInput {
  productId: string;
  warehouseId: string;
  quantity: number;
}

interface ReserveStockOutput {
  stockId: string;
  reservedQuantity: number;
}

export class ReserveStockUseCase {
  constructor(private stockRepo: IStockRepository) {}

  async execute(input: ReserveStockInput): Promise<ReserveStockOutput> {
    const quantity = Quantity.create(input.quantity);

    const stock = await this.stockRepo.findByProductAndWarehouse(
      input.productId,
      input.warehouseId,
    );
    if (!stock) {
      throw new NotFoundError("Stock", `${input.productId}/${input.warehouseId}`);
    }

    stock.reserve(quantity);
    await this.stockRepo.update(stock);

    return {
      stockId: stock.id,
      reservedQuantity: quantity.value,
    };
  }
}
