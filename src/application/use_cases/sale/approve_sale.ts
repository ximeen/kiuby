import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import type { IStockRepository } from "@domain/entities/stock/stock_repository";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { NotFoundError, ValidationError } from "@shared/errors/domain_error";

interface ApproveSaleInput {
  saleId: string;
  userId: string;
  warehouseId: string;
}

export class ApproveSaleUseCase {
  constructor(
    private saleRepo: ISaleRepository,
    private stockRepo: IStockRepository,
  ) {}

  async execute(input: ApproveSaleInput): Promise<void> {
    const sale = await this.saleRepo.findById(input.saleId);

    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    for (const item of sale.items) {
      const stock = await this.stockRepo.findByProductAndWarehouse(
        item.productId,
        input.warehouseId,
      );

      if (!stock) {
        throw new ValidationError(`Product ${item.productName} has no stock in warehouse`);
      }

      const required = Quantity.create(item.quantity.value);

      if (!stock.hasAvailableQuantity(required)) {
        throw new ValidationError(
          `Insufficient stock for product ${item.productName}. ` +
            `Available: ${stock.getAvailableQuantity().value}, Required: ${required.value}`,
        );
      }
    }

    for (const item of sale.items) {
      const stock = await this.stockRepo.findByProductAndWarehouse(
        item.productId,
        input.warehouseId,
      );

      if (stock) {
        const quantity = Quantity.create(item.quantity.value);
        stock.reserve(quantity);
        await this.stockRepo.update(stock);
      }
    }

    sale.approve(input.userId);
    await this.saleRepo.update(sale);
  }
}
