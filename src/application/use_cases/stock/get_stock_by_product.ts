import type { IStockRepository } from "@domain/entities/stock/stock_repository";

interface StockByProductItem {
  stockId: string;
  warehouseId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  status: string;
  lastMovementAt?: Date;
}

export class GetStockByProductUseCase {
  constructor(private stockRepo: IStockRepository) {}

  async execute(productId: string): Promise<StockByProductItem[]> {
    const stocks = await this.stockRepo.findByProduct(productId);

    return stocks.map((stock) => ({
      stockId: stock.id,
      warehouseId: stock.warehouseId,
      quantity: stock.quantity.value,
      reservedQuantity: stock.reservedQuantity.value,
      availableQuantity: stock.getAvailableQuantity().value,
      status: stock.status,
      lastMovementAt: stock.lastMovementAt,
    }));
  }
}
