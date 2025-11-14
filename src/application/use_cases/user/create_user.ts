import { Email } from "@domain/entities/customers/value_objects/email";
import { User, type UserRole } from "@domain/entities/user/user_entity";
import type { IUserRepository } from "@domain/entities/user/user_repository";
import { Password } from "@domain/entities/user/value_objects/password";
import { Username } from "@domain/entities/user/value_objects/username";
import { ConflictError } from "@shared/errors/domain_error";

interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

interface CreateUserOutput {
  id: string;
  username: string;
  email: string;
}

export class CreateUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    const existingByUserName = await this.userRepo.findByUsername(input.username);

    if (existingByUserName) {
      throw new ConflictError("Username already exists");
    }

    const user = User.create({
      name: input.name,
      username: Username.create(input.username),
      email: Email.create(input.email),
      password: await Password.create(input.password),
      role: input.role,
      phone: input.phone,
    });

    await this.userRepo.save(user);

    return {
      id: user.id,
      username: user.username.value,
      email: user.email.value,
    };
  }
}
