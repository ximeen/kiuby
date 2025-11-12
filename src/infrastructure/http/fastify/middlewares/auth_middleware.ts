import { UnauthorizedError } from "@shared/errors/domain_error";
import { verifyToken } from "@shared/utils/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";

interface JWTPayload {
  userId: string;
  username: string;
  role: string;
  permissions: string[];
}

declare module "fastify" {
  interface FastifyRequest {
    user: JWTPayload;
  }
}

const AUTH_SCHEME = "Bearer";

export async function authMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError("Missing authorization headers");
    }

    const token = extractBearerToken(authHeader);
    const payload = parseJWTToken(token);
    request.user = payload;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}

function extractBearerToken(authHeader: string): string {
  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    throw new UnauthorizedError("Malformed authorization header");
  }
  const [schema, token] = parts;

  if (schema !== AUTH_SCHEME) {
    throw new UnauthorizedError(`Invalid authorization scheme. Expected ${AUTH_SCHEME}`);
  }

  if (!token || token.trim().length === 0) {
    throw new UnauthorizedError("Missing token");
  }

  return token;
}

function parseJWTToken(token: string): JWTPayload {
  try {
    const payload = verifyToken(token);
    validatePayload(payload);

    return payload;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError("Invalid or malformed token");
  }
}

function validatePayload(payload: any): asserts payload is JWTPayload {
  const requiredFields: (keyof JWTPayload)[] = ["userId", "username", "role", "permissions"];

  for (const field of requiredFields) {
    if (!(field in payload)) {
      throw new UnauthorizedError(`Invalid token payload: missing ${field}`);
    }
  }

  if (!Array.isArray(payload.permissions)) {
    throw new UnauthorizedError("Invalid token payload: permissions must be an array");
  }
  if (
    typeof payload.userId !== "string" ||
    typeof payload.username !== "string" ||
    typeof payload.role !== "string"
  ) {
    throw new UnauthorizedError("Invalid token payload: Invalid type fields");
  }
}
