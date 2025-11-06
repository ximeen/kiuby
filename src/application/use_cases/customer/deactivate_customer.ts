import type { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { NotFoundError } from "@shared/errors/domain_error";

export class DeactivateCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(id: string): Promise<void> {
    const customer = await this.customerRepo.findById(id);

    if (!customer) {
      throw new NotFoundError("Customer", id);
    }

    customer.deactivate();
    await this.customerRepo.update(customer);
  }
}
