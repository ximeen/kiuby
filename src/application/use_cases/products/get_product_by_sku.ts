import { IProductRepository } from "@domain/entities/product/product_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface GetProductBySkuOutput {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: string;
}

export class GetProductBySkuUseCase {
  constructor(private productRepo: IProductRepository) {}

  async execute(sku: string): Promise<GetProductBySkuOutput> {
    const product = await this.productRepo.findBySku(sku);

    if (!product) {
      throw new NotFoundError("Product", sku);
    }

    return {
      id: product.id,
      name: product.name.value,
      sku: product.sku.value,
      price: product.price.amount,
      status: product.status,
    };
  }
}
