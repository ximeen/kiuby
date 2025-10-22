import type { Product } from "./product_entity";

export interface IProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(filters?: ProductFilters): Promise<Product[]>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<void>;
}

export interface ProductFilters {
  status?: string;
  categoryId?: string;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
}
