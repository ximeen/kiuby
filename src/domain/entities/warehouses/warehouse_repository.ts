import type { Warehouse } from "./warehouses_entity";

export interface IWarehouseRepository {
  save(warehouse: Warehouse): Promise<void>;
  findById(id: string): Promise<Warehouse | null>;
  findByCode(code: string): Promise<Warehouse | null>;
  findAll(filters?: WarehouseFilters): Promise<Warehouse[]>;
  findActive(): Promise<Warehouse[]>;
  findByManager(managerId: string): Promise<Warehouse[]>;
  update(warehouse: Warehouse): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export interface WarehouseFilters {
  status?: string;
  type?: string;
  searchTerm?: string;
}
