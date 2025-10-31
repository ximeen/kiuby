import type { IUserRepository } from "@domain/entities/user/user_repository";

interface ListUsersInput {
  status?: string;
  role?: string;
  searchTerm?: string;
}

interface ListUserOutput {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt?: Date;
}

export class ListUsersUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(filters?: ListUsersInput): Promise<ListUserOutput[]> {
    const users = await this.userRepo.findAll(filters);

    return users.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username.value,
      email: u.email.value,
      role: u.role,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
    }));
  }
}
