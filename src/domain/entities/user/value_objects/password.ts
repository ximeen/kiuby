import { ValueObject } from "@domain/shared/value_object";
import bcrypt from "bcrypt";
import { PasswordValidator } from "@shared/utils/password-validator";

export class Password extends ValueObject<{ hash: string }> {
  private constructor(hash: string) {
    super({ hash });
  }

  static async create(plainPassword: string): Promise<Password> {
    if (!plainPassword) {
      throw new Error("Password cannot be empty");
    }

    PasswordValidator.validateAndThrow(plainPassword);

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
