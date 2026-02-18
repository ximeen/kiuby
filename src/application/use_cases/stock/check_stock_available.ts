import type { IStockRepository } from "@domain/entities/stock/stock_repository";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";

interface CheckStockInput {
  productId: string;
  warehouseId?: string;
  requiredQuantity: number;
}

interface StockAvailability {
  available: boolean;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  stocks: Array<{
    stockId: string;
    warehouseId: string;
    quantity: number;
    available: number;
  }>;
}

export class CheckStockAvailabilityUseCase {
  constructor(private stockRepo: IStockRepository) {}

  async execute(input: CheckStockInput): Promise<StockAvailability> {
    const required = Quantity.create(input.requiredQuantity);

    const stocks = input.warehouseId
      ? [await this.stockRepo.findByProductAndWarehouse(input.productId, input.warehouseId)]
      : await this.stockRepo.findByProduct(input.productId);

    let totalQuantity = 0;
    let totalAvailable = 0;
    let totalReserved = 0;

    const stockDetails = stocks
      .filter((s): s is NonNullable<typeof s> => !!s?.isActive())
      .map((stock) => {
        const qty = stock.quantity.value;
        const available = stock.getAvailableQuantity().value;
        const reserved = stock.reservedQuantity.value;

        totalQuantity += qty;
        totalAvailable += available;
        totalReserved += reserved;

        return {
          stockId: stock.id,
          warehouseId: stock.warehouseId,
          quantity: qty,
          available,
        };
      });

    return {
      available: totalAvailable >= required.value,
      totalQuantity,
      availableQuantity: totalAvailable,
      reservedQuantity: totalReserved,
      stocks: stockDetails,
    };
  }
}
