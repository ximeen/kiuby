import { RefreshToken } from "@domain/entities/auth/refresh_token_entity";
import type { IRefreshTokenRepository } from "@domain/entities/auth/refresh_token_repository";
import { db } from "../drizzle/client";
import { refreshTokens } from "../drizzle/schema";
import { eq, lt } from "drizzle-orm";

export class DrizzleRefreshTokenRepository implements IRefreshTokenRepository {
  async save(refreshToken: RefreshToken): Promise<void> {
    await db.insert(refreshTokens).values({
      id: refreshToken.id,
      token: refreshToken.token,
      userId: refreshToken.userId,
      expiresAt: refreshToken.expiresAt,
      isRevoked: refreshToken.isRevoked,
      deviceInfo: refreshToken.deviceInfo,
      ipAddress: refreshToken.ipAddress,
    });
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const result = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token))
      .limit(1);

    if (result.length === 0) return null;

    return this.toDomain(result[0]);
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const result = await db.select().from(refreshTokens).where(eq(refreshTokens.userId, userId));

    return result.map((row) => this.toDomain(row));
  }

  async update(refreshToken: RefreshToken): Promise<void> {
    await db
      .update(refreshTokens)
      .set({
        isRevoked: refreshToken.isRevoked,
        updatedAt: new Date(),
      })
      .where(eq(refreshTokens.id, refreshToken.id));
  }

  async delete(id: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.id, id));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await db.delete(refreshTokens).where(eq(refreshTokens.userId, userId));
  }

  async deleteExpired(): Promise<void> {
    await db.delete(refreshTokens).where(lt(refreshTokens.expiresAt, new Date()));
  }

  private toDomain(row: any): RefreshToken {
    return RefreshToken.create(
      {
        token: row.token,
        userId: row.userId,
        expiresAt: row.expiresAt,
        isRevoked: row.isRevoked,
        deviceInfo: row.deviceInfo,
        ipAddress: row.ipAddress,
      },
      row.id,
    );
  }
}
