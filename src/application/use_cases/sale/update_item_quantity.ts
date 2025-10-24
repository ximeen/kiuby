import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { NotFoundError } from "@shared/errors/domain_error";

interface UpdateItemQuantityInput {
  saleId: string;
  itemId: string;
  quantity: number;
}

export class UpdateItemQuantityUseCase {
  constructor(private saleRepo: ISaleRepository) {}

  async execute(input: UpdateItemQuantityInput): Promise<void> {
    const sale = await this.saleRepo.findById(input.itemId);

    if (!sale) {
      throw new NotFoundError("Sale", input.itemId);
    }

    const quantity = Quantity.create(input.quantity);
    sale.updateItemQuantity(input.itemId, quantity);

    await this.saleRepo.update(sale);
    await this.saleRepo.saveItems(sale.id, sale.items);
  }
}
