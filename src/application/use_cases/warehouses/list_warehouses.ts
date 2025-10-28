import type { IWarehouseRepository } from "@domain/entities/warehouses/warehouse_repository";

interface ListWarehousesInput {
  status?: string;
  type?: string;
  searchTerm?: string;
}

interface WarehouseListItem {
  id: string;
  name: string;
  code: string;
  type: string;
  status: string;
  city?: string;
  managerId?: string;
}

export class ListWarehousesUseCase {
  constructor(private warehouseRepo: IWarehouseRepository) {}

  async execute(filters?: ListWarehousesInput): Promise<WarehouseListItem[]> {
    const warehouses = await this.warehouseRepo.findAll(filters);

    return warehouses.map((warehouse) => ({
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      type: warehouse.type,
      status: warehouse.status,
      city: warehouse.address?.city,
      managerId: warehouse.managerId,
    }));
  }
}
