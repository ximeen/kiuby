import type { FastifyRequest } from "fastify";

export function getCurrentUserId(request: FastifyRequest): string {
  const { userId } = request.user;

  if (!userId) {
    throw new Error("Unauthenticated user!");
  }

  return userId;
}
