import { IProductRepository } from "@domain/entities/product/product_repository";
import { NotFoundError } from "@shared/errors/domain_error";

export class DeactivateProductUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new NotFoundError("Product", id);
    }

    product.deactivate();
    await this.productRepo.update(product);
  }
}
