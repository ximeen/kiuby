import type { Customer } from "./customer_entity";

export interface ICustomerRepository {
  save(customer: Customer): Promise<void>;
  findById(id: string): Promise<Customer | null>;
  findByDocument(document: string): Promise<Customer | null>;
  findByEmail(email: string): Promise<Customer | null>;
  findAll(filters?: CustomerFilters): Promise<Customer[]>;
  update(customer: Customer): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export interface CustomerFilters {
  status?: string;
  type?: string;
  searchTerm?: string;
  hasDebt?: boolean;
  hasCreditLimit?: boolean;
}
