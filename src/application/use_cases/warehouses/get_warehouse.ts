import type { IWarehouseRepository } from "@domain/entities/warehouses/warehouse_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface GetWarehouseOutput {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  phone?: string;
  email?: string;
  managerId?: string;
  capacity?: number;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetWarehouseUseCase {
  constructor(private warehouseRepo: IWarehouseRepository) {}

  async execute(id: string): Promise<GetWarehouseOutput> {
    const warehouse = await this.warehouseRepo.findById(id);

    if (!warehouse) {
      throw new NotFoundError("Warehouse", id);
    }

    return {
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      type: warehouse.type,
      status: warehouse.status,
      phone: warehouse.phone,
      email: warehouse.email,
      managerId: warehouse.managerId,
      capacity: warehouse.capacity,
      address: warehouse.address
        ? {
            street: warehouse.address.street,
            number: warehouse.address.number,
            complement: warehouse.address.complement,
            neighborhood: warehouse.address.neighborhood,
            city: warehouse.address.city,
            state: warehouse.address.state,
            zipCode: warehouse.address.zipCode,
          }
        : undefined,
      notes: warehouse.notes,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    };
  }
}
