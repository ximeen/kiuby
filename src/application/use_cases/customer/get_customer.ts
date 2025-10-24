import type { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface GetCustomerOutput {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  type: string;
  status: string;
  companyName?: string;
  creditLimit?: number;
  currentDebt: number;
  availableCredit: number;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class GetCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(id: string): Promise<GetCustomerOutput> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new NotFoundError("Customer", id);
    }

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email?.value,
      phone: customer.phone?.value,
      document: customer.document?.value,
      type: customer.type,
      status: customer.status,
      companyName: customer.companyName,
      creditLimit: customer.creditLimit,
      currentDebt: customer.currentDebt,
      availableCredit: customer.getAvailableCredit(),
      address: customer.address
        ? {
            street: customer.address.street,
            number: customer.address.number,
            complement: customer.address.complement,
            neighborhood: customer.address.neighborhood,
            city: customer.address.city,
            state: customer.address.state,
            zipCode: customer.address.zipCode,
          }
        : undefined,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
