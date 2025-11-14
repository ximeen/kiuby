import { ValueObject } from "@domain/shared/value_object";
import bcrypt from "bcrypt";

export class Password extends ValueObject<{ hash: string }> {
  private constructor(hash: string) {
    super({ hash });
  }

  static async create(plainPassword: string): Promise<Password> {
    if (!plainPassword) {
      throw new Error("Password cannot be empty");
    }
    if (plainPassword.length < 3) {
      throw new Error("Password must be at least 6 characters");
    }
    if (plainPassword.length > 100) {
      throw new Error("Password cannot exceed 100 characters");
    }

    const hash = await bcrypt.hash(plainPassword, 10);
    return new Password(hash);
  }

  static fromHash(hash: string): Password {
    return new Password(hash);
  }

  get hash(): string {
    return this.props.hash;
  }

  async verify(plainPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, this.props.hash);
  }
}
