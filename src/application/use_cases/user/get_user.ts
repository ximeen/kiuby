import type { Permission } from "@domain/entities/user/permissions";
import type { IUserRepository } from "@domain/entities/user/user_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface GetUserOutput {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  phone?: string;
  permissions: Permission[];
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class GetUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(id: string): Promise<GetUserOutput> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User", id);
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username.value,
      email: user.email.value,
      role: user.role,
      status: user.status,
      phone: user.phone,
      permissions: user.getPermissions(),
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
