import { ValueObject } from "@domain/shared/value_object";

export class Email extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }
  static create(value: string): Email {
    const trimmed = value.trim().toLowerCase();

    if (!trimmed) {
      throw new Error("Email cannot be empty");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error("Invalid email format");
    }
    return new Email(trimmed);
  }

  get value(): string {
    return this.props.value;
  }

  getDomain(): string {
    return this.props.value.split("@")[1];
  }
}
