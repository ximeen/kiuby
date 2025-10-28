import { ValueObject } from "@domain/shared/value_object";

export class Username extends ValueObject<{ value: string }> {
  private constructor(value: string) {
    super({ value });
  }

  static create(value: string): Username {
    const cleaned = value.trim().toLowerCase();

    if (!cleaned) {
      throw new Error("Usename cannot be empty");
    }
    if (cleaned.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }
    if (cleaned.length > 50) {
      throw new Error("Username cannot exceed 50 characters");
    }
    if (!/^[a-z0-9._-]+$/.test(cleaned)) {
      throw new Error(
        "Username can only contain lowercase letters, numbers, dots, hyphens and undescores",
      );
    }

    if (/^[._-]/.test(cleaned) || /[._-]$/.test(cleaned)) {
      throw new Error("Username cannot start or end with special characters");
    }

    return new Username(cleaned);
  }

  get value(): string {
    return this.props.value;
  }
}
