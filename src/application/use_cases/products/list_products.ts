import type {
  IProductRepository,
  ProductFilters,
} from "@domain/entities/product/product_repository";

interface ProductListItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  costPrice?: number;
  status: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ListProductsUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(filters?: ProductFilters): Promise<ProductListItem[]> {
    const products = await this.productRepo.findAll(filters);

    return products.map((p) => ({
      id: p.id,
      name: p.name.value,
      sku: p.sku.value,
      price: p.price.amount,
      costPrice: p.costPrice?.amount,
      status: p.status,
      unit: p.unit,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }
}
