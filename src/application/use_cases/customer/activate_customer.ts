import type { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { NotFoundError } from "@shared/errors/domain_error";

export class ActivateCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}
  async execute(id: string): Promise<void> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new NotFoundError("Customer", id);
    }
    customer.activate();
    await this.customerRepo.update(customer);
  }
}
