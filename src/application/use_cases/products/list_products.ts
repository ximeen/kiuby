import type {
  IProductRepository,
  ProductFilters,
} from "@domain/entities/product/product_repository";

interface ProductListItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: string;
  unit: string;
}

export class ListProductsUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(filters?: ProductFilters): Promise<ProductListItem[]> {
    const products = await this.productRepo.findAll(filters);

    return products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.sku,
      status: p.status,
      unit: p.unit,
    }));
  }
}
