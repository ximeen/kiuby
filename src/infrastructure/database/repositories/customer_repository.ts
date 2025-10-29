import {
  Customer,
  type CustomerStatus,
  type CustomerType,
} from "@domain/entities/customers/customer_entity";
import type {
  CustomerFilters,
  ICustomerRepository,
} from "@domain/entities/customers/customer_repository";
import { Address } from "@domain/entities/customers/value_objects/address";
import { Document, DocumentType } from "@domain/entities/customers/value_objects/document";
import { Email } from "@domain/entities/customers/value_objects/email";
import { Phone } from "@domain/entities/customers/value_objects/phone";
import { and, eq, ilike, isNotNull, or } from "drizzle-orm";
import { db } from "../drizzle/client";
import { customers } from "../drizzle/schema";

export class DrizzleCustomerRepository implements ICustomerRepository {
  async save(customer: Customer): Promise<void> {
    await db.insert(customers).values({
      id: customer.id,
      name: customer.name,
      email: customer.email?.value,
      phone: customer.phone?.value,
      document: customer.document?.value,
      documentType: customer.document?.type,
      type: customer.type,
      status: customer.status,
      birthdate: customer.birthdate?.toISOString().split("T")[0],
      companyName: customer.companyName,
      notes: customer.notes,
      creditLimit: customer.creditLimit?.toString(),
      currentDebt: customer.currentDebt.toString(),
      street: customer.address?.street,
      number: customer.address?.number,
      complement: customer.address?.complement,
      neighborhood: customer.address?.neighborhood,
      city: customer.address?.city,
      state: customer.address?.state,
      zipCode: customer.address?.zipCode,
      country: customer.address?.country,
    });
  }

  async findById(id: string): Promise<Customer | null> {
    const result = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
    if (result.length === 0) return null;
    return this.toDomain(result[0]);
  }

  async findByDocument(document: string): Promise<Customer | null> {
    const cleaned = document.replace(/\D/g, "");

    const result = await db
      .select()
      .from(customers)
      .where(eq(customers.document, cleaned))
      .limit(1);

    if (result.length === 0) return null;

    return this.toDomain(result[0]);
  }

  async findByEmail(email: string): Promise<Customer | null> {
    const result = await db.select().from(customers).where(eq(customers.email, email)).limit(1);

    if (result.length === 0) return null;

    return this.toDomain(result[0]);
  }

  async findAll(filters?: CustomerFilters): Promise<Customer[]> {
    let query = db.select().from(customers);

    const conditions = [];

    if (filters?.status) {
      conditions.push(eq(customers.status, filters.status as any));
    }

    if (filters?.type) {
      conditions.push(eq(customers.type, filters.type as any));
    }

    if (filters?.searchTerm) {
      conditions.push(
        or(
          ilike(customers.name, `%${filters.searchTerm}%`),
          ilike(customers.email, `%${filters.searchTerm}%`),
          ilike(customers.phone, `%${filters.searchTerm}%`),
          ilike(customers.document, `%${filters.searchTerm}%`),
          ilike(customers.companyName, `%${filters.searchTerm}%`),
        ),
      );
    }

    if (filters?.hasDebt !== undefined) {
      if (filters.hasDebt) {
        conditions.push(eq(customers.currentDebt, "0"));
      }
    }

    if (filters?.hasCreditLimit !== undefined) {
      if (filters.hasCreditLimit) {
        conditions.push(isNotNull(customers.creditLimit));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;
    return result.map((r) => this.toDomain(r));
  }

  async update(customer: Customer): Promise<void> {
    await db
      .update(customers)
      .set({
        name: customer.name,
        email: customer.email?.value,
        phone: customer.phone?.value,
        status: customer.status,
        birthdate: customer.birthdate?.toISOString().split("T")[0],
        companyName: customer.companyName,
        notes: customer.notes,
        creditLimit: customer.creditLimit?.toString(),
        currentDebt: customer.currentDebt.toString(),
        street: customer.address?.street,
        number: customer.address?.number,
        complement: customer.address?.complement,
        neighborhood: customer.address?.neighborhood,
        city: customer.address?.city,
        state: customer.address?.state,
        zipCode: customer.address?.zipCode,
        country: customer.address?.country,
        updatedAt: new Date(),
      })
      .where(eq(customers.id, customer.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  async exists(id: string): Promise<boolean> {
    const result = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);

    return result.length > 0;
  }

  private toDomain(row: any): Customer {
    const email = row.email ? Email.create(row.email) : undefined;
    const phone = row.phone ? Phone.create(row.phone) : undefined;

    let document: Document | undefined;
    if (row.document && row.documentType) {
      document =
        row.documentType === DocumentType.CPF
          ? Document.createCPF(row.document)
          : Document.createCNPJ(row.document);
    }

    const address =
      row.street && row.number
        ? Address.create({
            street: row.street,
            number: row.number,
            complement: row.complement,
            neighborhood: row.neighborhood,
            city: row.city,
            state: row.state,
            zipCode: row.zipCode,
            country: row.country || "BR",
          })
        : undefined;

    return Customer.create(
      {
        name: row.name,
        email,
        phone,
        document,
        type: row.type as CustomerType,
        status: row.status as CustomerStatus,
        birthdate: row.birthdate,
        companyName: row.companyName,
        notes: row.notes,
        creditLimit: row.creditLimit ? parseFloat(row.creditLimit) : undefined,
        currentDebt: parseFloat(row.currentDebt),
        address,
      },
      row.id,
    );
  }
}
