import { ActivateUserUseCase } from "@application/use_cases/user/activate_user";
import { AuthenticateUserUseCase } from "@application/use_cases/user/authenticate_user";
import { BlockUserUseCase } from "@application/use_cases/user/block_user";
import { ChangeUserPasswordUseCase } from "@application/use_cases/user/change_user_password";
import { ChangeUserRoleUseCase } from "@application/use_cases/user/change_user_role";
import { CreateUserUseCase } from "@application/use_cases/user/create_user";
import { GetUserUseCase } from "@application/use_cases/user/get_user";
import { ListUsersUseCase } from "@application/use_cases/user/list_users";
import { UpdateUserUseCase } from "@application/use_cases/user/update_user";
import type { UserRole } from "@domain/entities/user/user_entity";
import { HTTP_STATUS } from "@shared/constants";
import { getRefreshTokenRepository, getUserRepository } from "@shared/container/repositories";
import type { FastifyReply, FastifyRequest } from "fastify";
import { email, enum as enum_, object, string } from "zod";

export const createUserSchema = object({
  name: string().min(3),
  username: string().min(3),
  email: email(),
  password: string(),
  role: enum_(["admin", "manager", "salesperson", "stock_manager", "viewer"]),
  phone: string().optional(),
});

export const authenticateUserSchema = object({
  username: string(),
  password: string(),
});

export const updateUserSchema = object({
  name: string().min(3).optional(),
  email: email().optional(),
  phone: string().optional(),
});

export const changePasswordSchema = object({
  currentPassword: string(),
  newPassword: string().min(6),
});

export const changeRoleSchema = object({
  role: enum_(["admin", "manager", "salesperson", "stock_manager", "viewer"]),
});

export class UserController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createUserSchema.parse(request.body);

    const useCase = new CreateUserUseCase(getUserRepository());
    const result = await useCase.execute({
      ...data,
      role: data.role as UserRole,
    });

    return reply.status(HTTP_STATUS.CREATED).send(result);
  }

  async authenticate(request: FastifyRequest, reply: FastifyReply) {
    const data = authenticateUserSchema.parse(request.body);
    const useCase = new AuthenticateUserUseCase(getUserRepository(), getRefreshTokenRepository());
    const result = await useCase.execute(data);
    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const useCase = new GetUserUseCase(getUserRepository());
    const result = await useCase.execute(id);
    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { status, role, searchTerm } = request.query as {
      status?: string;
      role?: string;
      searchTerm?: string;
    };
    const useCase = new ListUsersUseCase(getUserRepository());
    const result = await useCase.execute({ status, role, searchTerm });
    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = updateUserSchema.parse(request.body);
    const useCase = new UpdateUserUseCase(getUserRepository());
    await useCase.execute({ id, ...data });

    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = changePasswordSchema.parse(request.body);
    const useCase = new ChangeUserPasswordUseCase(getUserRepository());
    await useCase.execute({ userId: id, ...data });
    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async changeRole(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = changeRoleSchema.parse(request.body);
    const useCase = new ChangeUserRoleUseCase(getUserRepository());
    await useCase.execute({ userId: id, newRole: data.role as UserRole });
    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async block(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const useCase = new BlockUserUseCase(getUserRepository());
    await useCase.execute(id);
    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async activate(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const useCase = new ActivateUserUseCase(getUserRepository());
    await useCase.execute(id);
    return reply.send(HTTP_STATUS.NO_CONTENT).send();
  }
}
