import { Email } from "@domain/entities/customers/value_objects/email";
import type { IUserRepository } from "@domain/entities/user/user_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
}

export class UpdateUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(input: UpdateUserInput): Promise<void> {
    const user = await this.userRepo.findById(input.id);

    if (!user) {
      throw new NotFoundError("User", input.id);
    }

    if (input.name) {
      user.updateName(input.name);
    }

    if (input.email) {
      user.updateEmail(Email.create(input.email));
    }

    if (input.phone !== undefined) {
      user.updatePhone(input.phone);
    }

    await this.userRepo.update(user);
  }
}
