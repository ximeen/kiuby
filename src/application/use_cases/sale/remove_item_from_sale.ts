import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface RemoveItemInput {
  saleId: string;
  itemId: string;
}

export class RemoveItemFromSaleUseCase {
  constructor(private saleRepo: ISaleRepository) {}

  async execute(input: RemoveItemInput): Promise<void> {
    const sale = await this.saleRepo.findById(input.saleId);

    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    sale.removeItem(input.itemId);
    await this.saleRepo.update(sale);
    await this.saleRepo.saveItems(sale.id, sale.items);
  }
}
