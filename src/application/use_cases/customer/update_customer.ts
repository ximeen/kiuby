import type { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { Address } from "@domain/entities/customers/value_objects/address";
import { Email } from "@domain/entities/customers/value_objects/email";
import { Phone } from "@domain/entities/customers/value_objects/phone";
import { NotFoundError } from "@shared/errors/domain_error";

interface UpdateCustomerInput {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  creditLimit?: number;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
}

export class UpdateCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(input: UpdateCustomerInput): Promise<void> {
    const customer = await this.customerRepo.findById(input.id);

    if (!customer) {
      throw new NotFoundError("Customer", input.id);
    }

    if (input.name) {
      customer.updateName(input.name);
    }
    if (input.email) {
      customer.updateEmail(Email.create(input.email));
    }
    if (input.phone) {
      customer.updatePhone(Phone.create(input.phone));
    }
    if (input.notes !== undefined) {
      customer.updateNotes(input.notes);
    }
    if (input.creditLimit !== undefined) {
      customer.setCreditLimit(input.creditLimit);
    }
    if (input.address) {
      customer.updateAddress(Address.create(input.address));
    }

    await this.customerRepo.save(customer);
  }
}
