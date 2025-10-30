import type { IProductRepository } from "@domain/entities/product/product_repository";
import { Money } from "@domain/entities/product/value_objects/money";
import { NotFoundError } from "@shared/errors/domain_error";

interface UpdateProductInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  costPrice?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
}

export class UpdateProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(input: UpdateProductInput): Promise<void> {
    const product = await this.productRepo.findById(input.id);
    if (!product) {
      throw new NotFoundError("Product", input.id);
    }

    if (input.price !== undefined) {
      product.updatePrice(Money.create(input.price));
    }

    if (input.costPrice !== undefined) {
      product.updateCostPrice(Money.create(input.costPrice));
    }

    if (input.description !== undefined) {
      product.updateDescription(input.description);
    }

    if (input.minStockLevel !== undefined) {
      product.updateStockLevels(input.minStockLevel, input.maxStockLevel);
    }

    await this.productRepo.update(product);
  }
}
