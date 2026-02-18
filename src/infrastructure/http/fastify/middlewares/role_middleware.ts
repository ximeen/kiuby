import { UserRole } from "@domain/entities/user/user_entity";
import { ForbiddenError, UnauthorizedError } from "@shared/errors/domain_error";
import type { FastifyReply, FastifyRequest } from "fastify";

export function requireRole(allowedRoles: UserRole[]) {
  if (!allowedRoles.length) {
    throw new Error("At least one role must be specified");
  }

  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = request.user;
    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }
    if (!user.role || typeof user.role !== "string") {
      throw new ForbiddenError("Invalid user role");
    }
    if (!isAllowedRole(user.role, allowedRoles)) {
      throw new ForbiddenError(
        `Access danied. Required role ${allowedRoles.length > 1 ? "s" : ""}: ${allowedRoles.join(", ")}`,
      );
    }
  };
}

function isAllowedRole(userRole: string, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole as UserRole);
}

export const requireAdmin = () => requireRole([UserRole.ADMIN]);
export const requireModerator = () => requireRole([UserRole.ADMIN, UserRole.MANAGER]);

export function hasRole(request: FastifyRequest, role: UserRole): boolean {
  return request.user.role === role;
}

export function hasAnyRole(request: FastifyRequest, roles: UserRole[]): boolean {
  return request.user ? roles.includes(request.user.role as UserRole) : false;
}
