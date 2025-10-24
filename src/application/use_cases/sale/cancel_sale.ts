import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import type { IStockRepository } from "@domain/entities/stock/stock_repository";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { NotFoundError } from "@shared/errors/domain_error";

interface CancelSaleInput {
  saleId: string;
  warehouseId?: string;
}

export class CancelSaleUseCase {
  constructor(
    private saleRepo: ISaleRepository,
    private stockRepo: IStockRepository,
  ) {}

  async execute(input: CancelSaleInput): Promise<void> {
    const sale = await this.saleRepo.findById(input.saleId);
    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    if (sale.isApproved() && input.warehouseId) {
      for (const item of sale.items) {
        const stock = await this.stockRepo.findByProductAndWarehouse(
          item.productId,
          input.warehouseId,
        );

        if (stock) {
          const quantity = Quantity.create(item.quantity.value);
          stock.releaseReservation(quantity);
          await this.stockRepo.update(stock);
        }
      }
    }

    sale.cancel();
    await this.saleRepo.update(sale);
  }
}
