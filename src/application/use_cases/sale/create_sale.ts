import type { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import type { IProductRepository } from "@domain/entities/product/product_repository";
import { Money } from "@domain/entities/product/value_objects/money";
import { PaymentMethod, Sale } from "@domain/entities/sale/sale_entity";
import { SaleItem } from "@domain/entities/sale/sale_item_entity";
import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import { Discount } from "@domain/entities/sale/value_objects/discount";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { NotFoundError, ValidationError } from "@shared/errors/domain_error";

interface CreateSaleItemInput {
  productId: string;
  quantity: number;
  unitPrice?: number;
  discountType?: "percentage" | "fixed";
  discountValue?: number;
}

interface CreateSaleInput {
  customerId: string;
  items: CreateSaleItemInput[];
  paymentMethod?: PaymentMethod;
  notes?: string;
  userId: string;
  saleDiscountType?: "percentage" | "fixed";
  saleDiscountValue?: number;
}

interface CreateSaleOutput {
  id: string;
  total: number;
  itemsCount: number;
}

export class CreateSaleUseCase {
  constructor(
    private saleRepo: ISaleRepository,
    private customerRepo: ICustomerRepository,
    private productRepo: IProductRepository,
  ) {}

  async execute(input: CreateSaleInput): Promise<CreateSaleOutput> {
    const customer = await this.customerRepo.findById(input.customerId);

    if (!customer) {
      throw new NotFoundError("Customer", input.customerId);
    }

    if (customer.isBlocked()) {
      throw new ValidationError("Customer is blocked");
    }

    if (!customer.isActive()) {
      throw new ValidationError("Customer is not active");
    }
    if (input.items.length === 0) {
      throw new ValidationError("Sale must have at least one item");
    }

    const saleItems: SaleItem[] = [];

    for (const itemInput of input.items) {
      const product = await this.productRepo.findById(itemInput.productId);

      if (!product) {
        throw new NotFoundError("Product", itemInput.productId);
      }

      if (!product.isActive()) {
        throw new ValidationError(`Product ${product.name.value} is not active`);
      }

      const quantity = Quantity.create(itemInput.quantity);
      const unitPrice = itemInput.unitPrice ? Money.create(itemInput.unitPrice) : product.price;

      const discount =
        itemInput.discountType && itemInput.discountValue
          ? itemInput.discountType === "percentage"
            ? Discount.createPercentage(itemInput.discountValue)
            : Discount.createFixed(itemInput.discountValue)
          : Discount.none();

      const saleItem = SaleItem.create({
        productId: product.id,
        productName: product.name.value,
        quantity,
        unitPrice,
        discount,
      });

      saleItems.push(saleItem);
    }

    const saleDiscount =
      input.saleDiscountType && input.saleDiscountValue
        ? input.saleDiscountType === "percentage"
          ? Discount.createPercentage(input.saleDiscountValue)
          : Discount.createFixed(input.saleDiscountValue)
        : Discount.none();

    const sale = Sale.create({
      customerId: customer.id,
      customerName: customer.name,
      createdBy: input.userId,
      notes: input.notes,
      discount: saleDiscount,
      items: saleItems,
    });

    if (input.paymentMethod) {
      sale.setPaymentMethod(input.paymentMethod);
    }

    if (input.paymentMethod === PaymentMethod.CREDIT) {
      const total = sale.getTotal().amount;
      if (!customer.canPurchase(total)) {
        throw new ValidationError("Customer does not have sufficient credit limit");
      }
    }
    await this.saleRepo.save(sale);
    await this.saleRepo.saveItems(sale.id, saleItems);

    return {
      id: sale.id,
      total: sale.getTotal().amount,
      itemsCount: saleItems.length,
    };
  }
}
