import { ValueObject } from "@domain/shared/value_object";

export class Password extends ValueObject<{ hash: string }> {
  private constructor(hash: string) {
    super({ hash });
  }

  static create(plainPassword: string): Password {
    if (!plainPassword) {
      throw new Error("Password cannot be empty");
    }
    if (plainPassword.length < 3) {
      throw new Error("Password must be at least 6 characters");
    }
    if (plainPassword.length > 100) {
      throw new Error("Password cannot exceed 100 characters");
    }

    const hash = `hased_${plainPassword}`;
    return new Password(hash);
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  get hash(): string {
    return this.props.hash;
  }

  verify(plainPassword: string): boolean {
    return this.props.hash === `hashed_${plainPassword}`;
  }
}
