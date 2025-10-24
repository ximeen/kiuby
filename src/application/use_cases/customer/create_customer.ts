import { Customer, CustomerType } from "@domain/entities/customers/customer_entity";
import type { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { Address } from "@domain/entities/customers/value_objects/address";
import { Document } from "@domain/entities/customers/value_objects/document";
import { Email } from "@domain/entities/customers/value_objects/email";
import { Phone } from "@domain/entities/customers/value_objects/phone";
import { ConflictError } from "@shared/errors/domain_error";

interface CreateCustomerInput {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  type: CustomerType;
  companyName?: string;
  birthDate?: Date;
  creditLimit?: number;
  notes?: string;
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

interface CreateCustomerOutput {
  id: string;
  name: string;
}

export class CreateCustomerUseCase {
  constructor(private customerRepo: ICustomerRepository) {}

  async execute(input: CreateCustomerInput): Promise<CreateCustomerOutput> {
    if (input.document) {
      const existingCustomer = await this.customerRepo.findByDocument(input.document);
      if (existingCustomer) {
        throw new ConflictError("Customer with this document already exists");
      }
    }
    if (input.email) {
      const existingCustomer = await this.customerRepo.findByEmail(input.email);
      if (existingCustomer) {
        throw new ConflictError("Customer with this email already exists");
      }
    }

    const email = input.email ? Email.create(input.email) : undefined;
    const phone = input.phone ? Phone.create(input.phone) : undefined;

    let document: Document | undefined;
    if (input.document) {
      input.type === CustomerType.INDIVIDUAL
        ? Document.createCPF(input.document)
        : Document.createCNPJ(input.document);
    }

    const address = input.address ? Address.create(input.address) : undefined;

    const customer = Customer.create({
      name: input.name,
      email,
      phone,
      document,
      type: input.type,
      companyName: input.companyName,
      birthDate: input.birthDate,
      creditLimit: input.creditLimit,
      notes: input.notes,
      address,
    });

    await this.customerRepo.save(customer);

    return { id: customer.id, name: customer.name };
  }
}
