import type { Permission } from "@domain/entities/user/permissions";
import { ForbiddenError, UnauthorizedError } from "@shared/errors/domain_error";
import type { FastifyReply, FastifyRequest } from "fastify";

type PermissionStrategy = "some" | "every";

interface PermissionOptions {
  strategy?: PermissionStrategy;
}

export function requiredPermission(
  requiredPermissions: Permission[],
  options: PermissionOptions = {},
) {
  const { strategy = "some" } = options;
  if (!requiredPermissions.length) {
    throw new Error("At least one permission must be specified");
  }

  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    const user = request.user;

    if (!user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (!user.permissions || !Array.isArray(user.permissions)) {
      throw new ForbiddenError("Invalid user permissions");
    }

    const hasPermission = validatePermissions(user.permissions, requiredPermissions, strategy);

    if (!hasPermission) {
      throw new ForbiddenError(`
                Required permission ${requiredPermissions.length > 1 ? "s" : ""}: ${requiredPermissions.join(", ")}    
            `);
    }
  };
}

function validatePermissions(
  userPermissions: string[],
  requiredPermissions: Permission[],
  strategy: PermissionStrategy,
): boolean {
  const permissionSet = new Set(userPermissions);

  if (strategy === "every") {
    return requiredPermissions.every((permission) => permissionSet.has(permission));
  }
  return requiredPermissions.some((permission) => permissionSet.has(permission));
}

export function requiredAllPermissions(requiredPermissions: Permission[]) {
  return requiredPermission(requiredPermissions, { strategy: "every" });
}
