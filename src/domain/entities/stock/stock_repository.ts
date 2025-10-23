import type { Stock } from "./stock_entity";
import type { StockMovement } from "./stock_movement.entity";

export interface IStockRepository {
  save(stock: Stock): Promise<void>;
  findById(id: string): Promise<Stock | null>;
  findByProductAndWarehouse(productId: string, warehouseId: string): Promise<Stock | null>;
  findByProduct(productId: string): Promise<Stock[]>;
  findByWarehouse(warehouseId: string): Promise<Stock[]>;
  update(stock: Stock): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IStockMovementRepository {
  save(movement: StockMovement): Promise<void>;
  findById(id: string): Promise<StockMovement | null>;
  findByStock(stockId: string, filters?: MovementFilters): Promise<StockMovement[]>;
  findByProduct(productId: string, filters: MovementFilters): Promise<StockMovement[]>;
  findByReference(referenceId: string, referenceType: string): Promise<StockMovement[]>;
}

export interface MovementFilters {
  startDate?: Date;
  endDate?: Date;
  type?: string;
  reason?: string;
  userId?: string;
}
