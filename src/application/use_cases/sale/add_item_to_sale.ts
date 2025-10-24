import type { IProductRepository } from "@domain/entities/product/product_repository";
import { Money } from "@domain/entities/product/value_objects/money";
import { SaleItem } from "@domain/entities/sale/sale_item_entity";
import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import { Discount } from "@domain/entities/sale/value_objects/discount";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { NotFoundError, ValidationError } from "@shared/errors/domain_error";

interface AddItemInput {
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice?: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
}

export class AddItemToSaleUseCase {
  constructor(
    private saleRepo: ISaleRepository,
    private productRepo: IProductRepository,
  ) {}

  async execute(input: AddItemInput): Promise<void> {
    const sale = await this.saleRepo.findById(input.saleId);

    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    const product = await this.productRepo.findById(input.productId);
    if (!product) {
      throw new NotFoundError("Product", input.productId);
    }

    if (!product.isActive()) {
      throw new ValidationError(`Product ${product.name.value} is not active`);
    }

    const quantity = Quantity.create(input.quantity);
    const unitPrice = input.unitPrice ? Money.create(input.unitPrice) : product.price;

    const discount =
      input.discountType && input.discountValue
        ? input.discountType === "percentage"
          ? Discount.createPercentage(input.discountValue)
          : Discount.createFixed(input.discountValue)
        : Discount.none();

    const item = SaleItem.create({
      productId: product.id,
      productName: product.name.value,
      quantity,
      unitPrice,
      discount,
    });

    sale.addItem(item);
    await this.saleRepo.update(sale);
    await this.saleRepo.saveItems(sale.id, sale.items);
  }
}
