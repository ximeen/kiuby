import type { IUserRepository } from "@domain/entities/user/user_repository";
import { NotFoundError } from "@shared/errors/domain_error";

export class ActivateUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    user.activate();
    await this.userRepo.update(user);
  }
}
