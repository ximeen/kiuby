import { ValueObject } from "@domain/shared/value_object";

export class SKU extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(value: string): SKU {
    const cleaned = value.trim().toUpperCase();

    if (!cleaned) {
      throw new Error("SKU cannot be empty");
    }

    if (cleaned.length < 3 || cleaned.length > 50) {
      throw new Error("SKU must be between 3 and 50 characters");
    }

    if (!/^[A-Z0-9-_]+$/.test(cleaned)) {
      throw new Error("SKU can only contain letters, numbers, hyphens and underscores");
    }

    return new SKU(cleaned);
  }

  get value(): string {
    return this.props.value;
  }
}
