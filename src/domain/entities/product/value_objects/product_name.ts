import { ValueObject } from "@domain/shared/value_object";

export class ProductName extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(value: string): ProductName {
    const trimmed = value.trim();

    if (!trimmed) {
      throw new Error("Product name cannot be empy");
    }

    if (trimmed.length < 3) {
      throw new Error("Product name must be at least 3 characters");
    }

    if (trimmed.length > 200) {
      throw new Error("Product name cannot exceed 200 characters");
    }

    return new ProductName(trimmed);
  }

  get value(): string {
    return this.props.value;
  }
}
