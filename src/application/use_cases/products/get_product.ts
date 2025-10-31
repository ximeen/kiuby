import type { IProductRepository } from "@domain/entities/product/product_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface GetProductOutput {
  id: string;
  name: string;
  description?: string;
  sku: string;
  price: number;
  costPrice?: number;
  status: string;
  categoryId?: string;
  barcode?: string;
  minStockLevel: number;
  maxStockLevel?: number;
  unit: string;
  profitMargin?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class GetProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(id: string): Promise<GetProductOutput> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundError("Product", id);
    }

    let profitMargin: number | undefined;

    try {
      profitMargin = product.calculateProfitMargin();
    } catch {}
    return {
      id: product.id,
      name: product.name.value,
      description: product.description,
      sku: product.sku.value,
      price: product.price.amount,
      costPrice: product.costPrice?.amount,
      status: product.status,
      categoryId: product.categoryId,
      minStockLevel: product.minStockLevel,
      maxStockLevel: product.maxStockLevel,
      unit: product.unit,
      profitMargin,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
