import type { IWarehouseRepository } from "@domain/entities/warehouses/warehouse_repository";
import { NotFoundError } from "@shared/errors/domain_error";

export class DeactivateWarehouseUseCase {
  constructor(private warehouseRepo: IWarehouseRepository) {}

  async execute(id: string): Promise<void> {
    const warehouse = await this.warehouseRepo.findById(id);
    if (!warehouse) {
      throw new NotFoundError("Warehouse", id);
    }

    warehouse.deactivate();
    await this.warehouseRepo.update(warehouse);
  }
}
