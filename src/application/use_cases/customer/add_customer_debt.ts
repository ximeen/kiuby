import type { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface AddDebtInput {
  customerId: string;
  amount: number;
}

export class AddCustomerDebtUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(input: AddDebtInput): Promise<void> {
    const customer = await this.customerRepo.findById(input.customerId);

    if (!customer) {
      throw new NotFoundError("Customer", input.customerId);
    }

    customer.addDebt(input.amount);
    await this.customerRepo.update(customer);
  }
}
