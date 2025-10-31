import type { IUserRepository } from "@domain/entities/user/user_repository";
import { NotFoundError } from "@shared/errors/domain_error";

export class BlockUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);

    if (!user) {
      throw new NotFoundError("User", id);
    }

    user.block();
    await this.userRepo.update(user);
  }
}
