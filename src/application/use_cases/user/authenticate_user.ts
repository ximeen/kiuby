import type { Permission } from "@domain/entities/user/permissions";
import type { IUserRepository } from "@domain/entities/user/user_repository";
import { UnauthorizedError } from "@shared/errors/domain_error";

interface AuthenticateInput {
  username: string;
  password: string;
}

interface AuthenticateOutput {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  permissions: Permission[];
}

export class AuthenticateUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(input: AuthenticateInput): Promise<AuthenticateOutput> {
    const user = await this.userRepo.findByUsername(input.username);

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.isActive()) {
      throw new UnauthorizedError("User is not active");
    }

    if (user.isBlocked()) {
      throw new UnauthorizedError("User is blocked");
    }

    if (!user.verifyPassword(input.password)) {
      throw new UnauthorizedError("Invalid credentials");
    }

    user.recordLogin();

    await this.userRepo.update(user);

    return {
      id: user.id,
      name: user.name,
      username: user.username.value,
      email: user.email.value,
      role: user.role,
      permissions: user.getPermissions(),
    };
  }
}
