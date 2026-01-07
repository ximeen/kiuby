import type { IUserRepository } from "@domain/entities/user/user_repository";
import { Password } from "@domain/entities/user/value_objects/password";
import { NotFoundError, UnauthorizedError } from "@shared/errors/domain_error";

interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

export class ChangeUserPasswordUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const user = await this.userRepo.findById(input.userId);

    if (!user) {
      throw new NotFoundError("User", input.userId);
    }
    if (!user.verifyPassword(input.currentPassword)) {
      throw new UnauthorizedError("Current password is incorrect");
    }
    const newPassword = await Password.create(input.newPassword);
    user.updatePassword(newPassword);

    await this.userRepo.update(user);
  }
}
