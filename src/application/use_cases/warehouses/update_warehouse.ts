import { Address } from "@domain/entities/customers/value_objects/address";
import type { IWarehouseRepository } from "@domain/entities/warehouses/warehouse_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface UpdateWarehouseInput {
  id: string;
  name?: string;
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

export class UpdateWarehouseUseCase {
  constructor(private warehouseRepo: IWarehouseRepository) {}

  async execute(input: UpdateWarehouseInput): Promise<void> {
    const warehouse = await this.warehouseRepo.findById(input.id);

    if (!warehouse) {
      throw new NotFoundError("Warehouse", input.id);
    }

    if (input.name) {
      warehouse.updatedName(input.name);
    }

    if (input.phone !== undefined || input.email !== undefined) {
      warehouse.updateContact(input.phone, input.email);
    }

    if (input.managerId !== undefined) {
      if (input.managerId) {
        warehouse.assignManager(input.managerId);
      }
      warehouse.removeManager();
    }

    if (input.capacity !== undefined) {
      warehouse.setCapacity(input.capacity);
    }

    if (input.notes !== undefined) {
      warehouse.updateNotes(input.notes);
    }

    if (input.address) {
      warehouse.updatedAddress(Address.create(input.address));
    }

    await this.warehouseRepo.update(warehouse);
  }
}
