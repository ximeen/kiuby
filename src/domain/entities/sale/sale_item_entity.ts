import { Entity } from "@domain/shared/entity";
import { Money } from "../product/value_objects/money";
import type { Quantity } from "../stock/value_objects/quantity";
import type { Discount } from "./value_objects/discount";

interface SaleItemProps {
  productId: string;
  productName: string;
  quantity: Quantity;
  unitPrice: Money;
  discount: Discount;
}

export class SaleItem extends Entity<SaleItemProps> {
  private constructor(props: SaleItemProps, id?: string) {
    super(props, id);
  }

  static create(props: SaleItemProps, id?: string): SaleItem {
    if (props.quantity.isZero()) {
      throw new Error("Item quantity must be greater than zero");
    }
    if (props.unitPrice.amount <= 0) {
      throw new Error("Item unit price must be greater than zero");
    }

    return new SaleItem(props, id);
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  get unitPrice(): Money {
    return this.props.unitPrice;
  }

  get discount(): Discount {
    return this.props.discount;
  }

  getSubtotal(): Money {
    return this.props.unitPrice.multiply(this.props.quantity.value);
  }

  getDiscountAmount(): number {
    return this.props.discount.calculateDiscount(this.getSubtotal().amount);
  }

  getTotal(): Money {
    const subtotal = this.getSubtotal();
    const finalAmount = this.props.discount.apply(subtotal.amount);
    return Money.create(finalAmount, subtotal.currency);
  }

  updateQuantity(quantity: Quantity): void {
    if (quantity.isZero()) {
      throw new Error("Item quantity must be greater than zero");
    }
    this.props.quantity = quantity;
    this.touch();
  }
  updatePrice(price: Money): void {
    if (price.amount < 0) {
      throw new Error("Item pice must be greater than zero");
    }
    this.props.unitPrice = price;
    this.touch();
  }

  applyDiscount(discount: Discount): void {
    this.props.discount = discount;
    this.touch();
  }
}
