import { ListActiveSessionsUseCase } from "@application/use_cases/auth/list_active_sessions";
import { LogoutUseCase } from "@application/use_cases/auth/logout";
import { LogoutAllUseCase } from "@application/use_cases/auth/logout_all";
import { RefreshTokenUseCase } from "@application/use_cases/auth/refresh_token";
import { AuthenticateUserUseCase } from "@application/use_cases/user/authenticate_user";
import { getRefreshTokenRepository, getUserRepository } from "@shared/container/repositories";
import { getCurrentUserId } from "@shared/helpers/auth_helper";
import type { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const refreshSchema = z.object({
  refreshToken: z.string(),
});

export const logoutSchema = z.object({
  refreshToken: z.string(),
});

export class AuthController {
  async login(request: FastifyRequest, reply: FastifyReply) {
    const data = loginSchema.parse(request.body);

    const useCase = new AuthenticateUserUseCase(getUserRepository(), getRefreshTokenRepository());

    const result = await useCase.execute({
      ...data,
      deviceInfo: request.headers["user-agent"],
      ipAddress: request.ip,
    });

    return reply.status(200).send(result);
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const data = refreshSchema.parse(request.body);

    const useCase = new RefreshTokenUseCase(getRefreshTokenRepository(), getUserRepository());

    const result = await useCase.execute(data);
    return reply.status(200).send(result);
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const data = logoutSchema.parse(request.body);
    const useCase = new LogoutUseCase(getRefreshTokenRepository());
    await useCase.execute(data);

    return reply.status(200).send();
  }

  async logoutAll(request: FastifyRequest, reply: FastifyReply) {
    const userId = getCurrentUserId(request);

    const useCase = new LogoutAllUseCase(getRefreshTokenRepository());
    await useCase.execute({ userId });

    return reply.status(200).send();
  }

  async listSessions(request: FastifyRequest, reply: FastifyReply) {
    const userId = getCurrentUserId(request);
    const { refreshToken } = request.query as { refreshToken?: string };

    const useCase = new ListActiveSessionsUseCase(getRefreshTokenRepository());
    const result = await useCase.execute(userId, refreshToken);

    return reply.status(200).send(result);
  }
}
