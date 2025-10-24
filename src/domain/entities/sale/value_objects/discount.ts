import { ValueObject } from "@domain/shared/value_object";

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

interface DiscountProps {
  type: DiscountType;
  value: number;
}

export class Discount extends ValueObject<DiscountProps> {
  private constructor(props: DiscountProps) {
    super(props);
  }
  static createPercentage(value: number): Discount {
    if (value < 0 || value > 100) {
      throw new Error("Percentage discount must be between 0 and 100");
    }
    return new Discount({ type: DiscountType.PERCENTAGE, value });
  }

  static createFixed(value: number): Discount {
    if (value < 0) {
      throw new Error("Fixed discount cannot be negative");
    }
    return new Discount({ type: DiscountType.FIXED, value });
  }
  static none(): Discount {
    return new Discount({ type: DiscountType.FIXED, value: 0 });
  }

  get type(): DiscountType {
    return this.props.type;
  }

  get value(): number {
    return this.props.value;
  }

  calculateDiscount(amount: number): number {
    if (this.props.type == DiscountType.PERCENTAGE) {
      return (amount * this.props.value) / 100;
    }

    return Math.min(this.props.value, amount);
  }

  apply(amount: number): number {
    const discountAmount = this.calculateDiscount(amount);
    return Math.max(0, amount - discountAmount);
  }

  isNone(): boolean {
    return this.props.value === 0;
  }
}
