import { Product } from "@domain/entities/product/product_entity";
import type { IProductRepository } from "@domain/entities/product/product_repository";
import { Money } from "@domain/entities/product/value_objects/money";
import { ProductName } from "@domain/entities/product/value_objects/product_name";
import { SKU } from "@domain/entities/product/value_objects/sku";
import { ConflictError } from "@shared/errors/domain_error";

interface CreateProductInput {
  name: string;
  description?: string;
  sku: string;
  price: number;
  costPrice?: number;
  categoryId?: string;
  minStockLevel: number;
  maxStockLevel?: number;
  unit: string;
}

interface CreateProductOutput {
  id: string;
  sku: string;
  name: string;
}

export class CreateProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<CreateProductOutput> {
    const existingProduct = await this.productRepo.findBySku(input.sku);
    if (existingProduct) {
      throw new ConflictError("Product with this SKU already exists");
    }

    const product = Product.create({
      name: ProductName.create(input.name),
      description: input.description,
      sku: SKU.create(input.sku),
      price: Money.create(input.price),
      costPrice: input.costPrice ? Money.create(input.costPrice) : undefined,
      categoryId: input.categoryId,
      minStockLevel: input.minStockLevel,
      maxStockLevel: input.maxStockLevel,
      unit: input.unit,
    });

    await this.productRepo.save(product);

    return {
      id: product.id,
      sku: product.sku.value,
      name: product.name.value,
    };
  }
}
