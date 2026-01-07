import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "./env";

interface TokenPayload {
  userId: string;
  username: string;
  role: string;
  permissions: string[];
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRE_IN } as jwt.SignOptions);
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  } catch {
    throw new Error("Invalid or expired token");
  }
}

export function getRefreshTokenExpiration(): Date {
  const now = new Date();
  now.setDate(now.getDate() + 7);
  return now;
}
