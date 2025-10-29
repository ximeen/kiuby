import { IWarehouseRepository, WarehouseFilters } from "@domain/entities/warehouses/warehouse_repository";
import { Warehouse, WarehouseStatus, WarehouseType } from "@domain/entities/warehouses/warehouses_entity";
import { db } from "../drizzle/client";
import { warehouses } from "../drizzle/schema";
import { and, eq, ilike, or } from "drizzle-orm";
import { Address } from "@domain/entities/customers/value_objects/address";

export class DrizzleWarehouseRepository implements IWarehouseRepository {
  async save(warehouse: Warehouse): Promise<void> {
    await db.insert(warehouses).values({
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      type: warehouse.type,
      status: warehouse.status,
      phone: warehouse.phone,
      email: warehouse.email,
      managerId: warehouse.managerId,
      capacity: warehouse.capacity,
      street: warehouse.address?.street,
      number: warehouse.address?.number,
      complement: warehouse.address?.complement,
      neighborhood: warehouse.address?.neighborhood,
      city: warehouse.address?.city,
      state: warehouse.address?.state,
      zipCode: warehouse.address?.zipCode,
      country: warehouse.address?.country,
      notes: warehouse.notes,
    });
  }

  async findById(id: string): Promise<Warehouse | null> {
    const result = await db.select().from(warehouses).where(eq(warehouses.id, id)).limit(1);
    if (result.length === 0) {
      return null;
    }

    return this.toDomain(result[0]);
  }

  async findByCode(code: string): Promise<Warehouse | null> {
    const result = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.code, code))
      .limit(1);
    
    if(result.length === 0) return null;

    return this.toDomain(result[0])
    
  }

  async findAll(filters?: WarehouseFilters): Promise<Warehouse[]> {
    let query = db.select().from(warehouses)

    const conditions = [];

    if(filters?.status){
      conditions.push(eq(warehouses.status, filters.status as any))
    }

    if(filters?.type){
      conditions.push(eq(warehouses.type, filters.type as any))
    }

    if(filters?.searchTerm){
      conditions.push(
        or(
          ilike(warehouses.name, `${filters.searchTerm}`),
          ilike(warehouses.code, `${filters.searchTerm}`),
          ilike(warehouses.city, `${filters.searchTerm}`)
        )
      )
    }

    if(conditions.length > 0){
      query = query.where(and(...conditions)) as any
    }

    const result = await query;
    return result.map((row)=> this.toDomain(row))
  }

  async findActive(): Promise<Warehouse[]> {
      const result = await db
        .select()
        .from(warehouses)
        .where(eq(warehouses.status, "active"));

        return result.map((row) => this.toDomain(row))
  }

  async findByManager(managerId: string): Promise<Warehouse[]> {
    const result = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.managerId, managerId));

      return result.map((row)=> this.toDomain(row))
  }

  async update(warehouse: Warehouse): Promise<void> {
    await db
      .update(warehouses)
      .set({
        name: warehouse.name,
        type: warehouse.type,
        status: warehouse.status,
        phone: warehouse.phone,
        email: warehouse.email,
        managerId: warehouse.managerId,
        capacity: warehouse.capacity,
        street: warehouse.address?.street,
        number: warehouse.address?.number,
        complement: warehouse.address?.complement,
        neighborhood: warehouse.address?.neighborhood,
        city: warehouse.address?.city,
        state: warehouse.address?.state,
        zipCode: warehouse.address?.zipCode,
        country: warehouse.address?.country,
        notes: warehouse.notes,
        updatedAt: new Date(),
      })
      .where(eq(warehouses.id, warehouse.id))
  }

  async delete(id: string): Promise<void> {
    await db
      .delete(warehouses)
      .where(eq(warehouses.id, id))
  }

  async exists(id: string): Promise<boolean> {
    const result = await db
      .select()
      .from(warehouses)
      .where(eq(warehouses.id, id))
      .limit(1)

      return result.length > 0;
  }

private toDomain(row: any): Warehouse {
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

    return Warehouse.create(
      {
        name: row.name,
        code: row.code,
        type: row.type as WarehouseType,
        status: row.status as WarehouseStatus,
        phone: row.phone,
        email: row.email,
        managerId: row.managerId,
        capacity: row.capacity,
        address,
        notes: row.notes,
      },
      row.id
    );
  }
}
