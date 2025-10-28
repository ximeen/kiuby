import { IWarehouseRepository } from "@domain/entities/warehouses/warehouse_repository";
import { Warehouse } from "@domain/entities/warehouses/warehouses_entity";
import { db } from "../drizzle/client";
import { warehouses } from "../drizzle/schema";
import { eq } from "drizzle-orm";

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
}
