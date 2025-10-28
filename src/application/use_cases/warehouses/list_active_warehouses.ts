import type { IWarehouseRepository } from "@domain/entities/warehouses/warehouse_repository";

interface ActiveWarehouseItem {
  id: string;
  name: string;
  code: string;
  type: string;
}

export class ListActiveWarehousesUseCase {
  constructor(private warehouseRepo: IWarehouseRepository) {}

  async execute(): Promise<ActiveWarehouseItem[]> {
    const warehouses = await this.warehouseRepo.findActive();

    return warehouses.map((warehouse) => ({
      id: warehouse.id,
      name: warehouse.name,
      code: warehouse.code,
      type: warehouse.type,
    }));
  }
}
