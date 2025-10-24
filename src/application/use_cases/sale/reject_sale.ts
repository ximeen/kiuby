import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import { NotFoundError, ValidationError } from "@shared/errors/domain_error";

interface RejectSaleInput {
  saleId: string;
  userId: string;
  reason: string;
}

export class RejectSaleUseCase {
  constructor(private saleRepo: ISaleRepository) {}

  async execute(input: RejectSaleInput): Promise<void> {
    const sale = await this.saleRepo.findById(input.saleId);

    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    if (!input.reason.trim()) {
      throw new ValidationError("Rejection reason is required");
    }

    sale.reject(input.userId, input.reason);
    await this.saleRepo.update(sale);
  }
}
