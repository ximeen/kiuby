import type { ICustomerRepository } from "@domain/entities/customers/customer_repository";

interface ListCustomerInput {
  status?: string;
  type?: string;
  searchTerm?: string;
  hasDebt?: boolean;
  hasCreditLimit?: boolean;
}

interface CustomerListItem {
  id: string;
  name: string;
  email?: string;
  document?: string;
  type: string;
  status: string;
  currentDebt: number;
  availableCredit: number;
}

export class ListCustomersUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(filters?: ListCustomerInput): Promise<CustomerListItem[]> {
    const customers = await this.customerRepo.findAll(filters);

    return customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email?.value,
      document: customer.document?.value,
      type: customer.type,
      status: customer.status,
      currentDebt: customer.currentDebt,
      availableCredit: customer.getAvailableCredit(),
    }));
  }
}
