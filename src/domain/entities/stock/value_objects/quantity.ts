import { ValueObject } from "@domain/shared/value_object";

export class Quantity extends ValueObject<{ value: number }> {
  private constructor(value: number) {
    super({ value });
  }

  static create(value: number): Quantity {
    if (value < 0) {
      throw new Error("Quantity cannot be negative");
    }
    if (!Number.isFinite(value)) {
      throw new Error("Quantity must be a finite number");
    }
    return new Quantity(value);
  }

  static zero(): Quantity {
    return new Quantity(0);
  }

  get value(): number {
    return this.props.value;
  }

  add(quantity: Quantity): Quantity {
    return Quantity.create(this.value + quantity.value);
  }

  subtract(quantity: Quantity): Quantity {
    const result = this.value - quantity.value;

    if (result < 0) {
      throw new Error("Cannot subtract: result would be negative");
    }

    return Quantity.create(result);
  }

  isZero(): boolean {
    return this.value === 0;
  }

  isGreaterThan(quantity: Quantity): boolean {
    return this.value > quantity.value;
  }

  isLessThan(quantity: Quantity): boolean {
    return this.value < quantity.value;
  }

  isSufficientFor(required: Quantity): boolean {
    return this.value >= required.value;
  }
}
