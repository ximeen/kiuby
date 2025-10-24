import type { Sale } from "./sale_entity";
import type { SaleItem } from "./sale_item_entity";

export interface ISaleRepository {
  save(sale: Sale): Promise<void>;
  saveItems(saleId: string, items: SaleItem[]): Promise<void>;
  findById(id: string): Promise<Sale | null>;
  findByCustomer(customerId: string, filters?: SaleFilters): Promise<Sale[]>;
  findAll(filters?: SaleFilters): Promise<Sale[]>;
  findPendingAproval(): Promise<Sale[]>;
  update(sale: Sale): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface SaleFilters {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
  minTotal?: number;
  maxTotal?: number;
}
