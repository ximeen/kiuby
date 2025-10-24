import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface SubmitForApprovalInput {
  saleId: string;
}

export class SubmitForApprovalUseCase {
  constructor(private saleRepo: ISaleRepository) {}

  async execute(input: SubmitForApprovalInput): Promise<void> {
    const sale = await this.saleRepo.findById(input.saleId);
    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    sale.submitForApproval();
    await this.saleRepo.update(sale);
  }
}
