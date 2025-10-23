import { ValueObject } from "@domain/shared/value_object";

export class Phone extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(value: string): Phone {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      throw new Error("Phone cannot be empty");
    }
    if (cleaned.length < 10 || cleaned.length > 11) {
      throw new Error("Phone must be have 10 or 11 digits");
    }
    return new Phone(cleaned);
  }

  get value(): string {
    return this.props.value;
  }

  format(): string {
    const { value } = this.props;
    if (value.length === 11) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    }

    return `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
  }
}
