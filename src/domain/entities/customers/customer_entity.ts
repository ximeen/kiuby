import { Entity } from "@domain/shared/entity";
import type { Address } from "./value_objects/address";
import type { Document } from "./value_objects/document";
import type { Email } from "./value_objects/email";
import type { Phone } from "./value_objects/phone";

export enum CustomerType {
  INDIVIDUAL = "individual",
  COMPANY = "company",
}

export enum CustomerStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

interface CustomerProps {
  name: string;
  email?: Email;
  phone?: Phone;
  document?: Document;
  type: CustomerType;
  status: CustomerStatus;
  address?: Address;
  birthDate?: Date;
  companyName?: string;
  notes?: string;
  creditLimit?: number;
  currentDebt?: number;
}

export class Customer extends Entity<CustomerProps> {
  private constructor(props: CustomerProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<CustomerProps, "status" | "currentDebt"> & {
      status?: CustomerStatus;
      currentDebt?: number;
    },
    id?: string,
  ): Customer {
    if (!props.name.trim()) {
      throw new Error("Customer name is required");
    }
    if (props.name.trim().length < 3) {
      throw new Error("Customer name must be at least 3 characters");
    }
    if (props.type === CustomerType.COMPANY && !props.companyName) {
      throw new Error("Company name is required for company type");
    }
    if (props.document && props.type === CustomerType.INDIVIDUAL && !props.document.isCPF()) {
      throw new Error("Individual customers must have CPF");
    }
    if (props.document && props.type === CustomerType.COMPANY && !props.document.isCNPJ()) {
      throw new Error("Company customers must have CNPJ");
    }

    if (props.creditLimit !== undefined && props.creditLimit < 0) {
      throw new Error("Credit limit cannot be negative");
    }

    return new Customer(
      {
        ...props,
        name: props.name.trim(),
        status: props.status ?? CustomerStatus.ACTIVE,
        currentDebt: props.currentDebt ?? 0,
      },
      id,
    );
  }

  get name(): string {
    return this.props.name;
  }

  get email(): Email | undefined {
    return this.props.email;
  }

  get phone(): Phone | undefined {
    return this.props.phone;
  }

  get document(): Document | undefined {
    return this.props.document;
  }

  get type(): CustomerType {
    return this.props.type;
  }

  get status(): CustomerStatus {
    return this.props.status;
  }

  get address(): Address | undefined {
    return this.props.address;
  }

  get birthDate(): Date | undefined {
    return this.props.birthDate;
  }

  get companyName(): string | undefined {
    return this.props.companyName;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get creditLimit(): number | undefined {
    return this.props.creditLimit;
  }

  get currentDebt(): number {
    return this.props.currentDebt ?? 0;
  }

  // Métodos de negócio
  isIndividual(): boolean {
    return this.props.type === CustomerType.INDIVIDUAL;
  }

  isCompany(): boolean {
    return this.props.type === CustomerType.COMPANY;
  }

  isActive(): boolean {
    return this.props.status === CustomerStatus.ACTIVE;
  }

  isBlocked(): boolean {
    return this.props.status === CustomerStatus.BLOCKED;
  }

  updateName(name: string): void {
    if (!name?.trim()) {
      throw new Error("Name cannot be empty");
    }
    this.props.name = name.trim();
    this.touch();
  }

  updateEmail(email: Email): void {
    this.props.email = email;
    this.touch();
  }

  updatePhone(phone: Phone): void {
    this.props.phone = phone;
    this.touch();
  }

  updateAddress(address: Address): void {
    this.props.address = address;
    this.touch();
  }

  updateNotes(notes: string): void {
    this.props.notes = notes.trim();
    this.touch();
  }

  activate(): void {
    this.props.status = CustomerStatus.ACTIVE;
    this.touch();
  }

  deactivate(): void {
    this.props.status = CustomerStatus.INACTIVE;
    this.touch();
  }

  block(): void {
    this.props.status = CustomerStatus.BLOCKED;
    this.touch();
  }

  setCreditLimit(limit: number): void {
    if (limit < 0) {
      throw new Error("Credit limit cannot be negative");
    }
    this.props.creditLimit = limit;
    this.touch();
  }

  getAvailableCredit(): number {
    if (!this.props.creditLimit) return 0;
    return Math.max(0, this.props.creditLimit - this.currentDebt);
  }

  hasAvailableCredit(amount: number): boolean {
    if (!this.props.creditLimit) return false;
    return this.getAvailableCredit() >= amount;
  }

  addDebt(amount: number): void {
    if (amount <= 0) {
      throw new Error("Debt amount must be positive");
    }
    this.props.currentDebt = (this.props.currentDebt ?? 0) + amount;
    this.touch();
  }

  reduceDebt(amount: number): void {
    if (amount <= 0) {
      throw new Error("Payment amount must be positive");
    }
    if (amount > this.currentDebt) {
      throw new Error("Payment amount exceeds current debt");
    }
    this.props.currentDebt = this.currentDebt - amount;
    this.touch();
  }

  canPurchase(amount: number): boolean {
    if (this.isBlocked()) return false;
    if (!this.isActive()) return false;

    if (this.props.creditLimit) {
      return this.hasAvailableCredit(amount);
    }

    return true;
  }
}
