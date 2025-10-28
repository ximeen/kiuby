import { Address } from "@domain/entities/customers/value_objects/address";
import type { IWarehouseRepository } from "@domain/entities/warehouses/warehouse_repository";
import { Warehouse, type WarehouseType } from "@domain/entities/warehouses/warehouses_entity";
import { ConflictError } from "@shared/errors/domain_error";

interface CreateWarehouseInput {
  name: string;
  code: string;
  type: WarehouseType;
  phone?: string;
  email?: string;
  managerId?: string;
  capacity?: number;
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

interface CreateWarehouseOutput {
  id: string;
  code: string;
  name: string;
}

export class CreateWarehouseUseCase {
  constructor(private warehouseRepo: IWarehouseRepository) {}

  async execute(input: CreateWarehouseInput): Promise<CreateWarehouseOutput> {
    const existingWarehouse = await this.warehouseRepo.findByCode(input.code);
    if (!existingWarehouse) {
      throw new ConflictError("Warehouse with this code alreay exists");
    }

    const address = input.address ? Address.create(input.address) : undefined;

    const warehouse = Warehouse.create({
      name: input.name,
      code: input.code,
      type: input.type,
      phone: input.phone,
      email: input.email,
      managerId: input.managerId,
      capacity: input.capacity,
      notes: input.notes,
      address,
    });

    await this.warehouseRepo.save(warehouse);
    return {
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
    };
  }
}
