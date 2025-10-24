import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import { Discount } from "@domain/entities/sale/value_objects/discount";
import { NotFoundError } from "@shared/errors/domain_error";

interface ApplySaleDiscountInput {
  saleId: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

export class ApplySaleDiscountUseCase {
  constructor(private saleRepo: ISaleRepository) {}

  async execute(input: ApplySaleDiscountInput): Promise<void> {
    const sale = await this.saleRepo.findById(input.saleId);

    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    const discount =
      input.discountType === "percentage"
        ? Discount.createPercentage(input.discountValue)
        : Discount.createFixed(input.discountValue);

    sale.applySaleDiscount(discount);
    await this.saleRepo.update(sale);
  }
}
