import type { IRefreshTokenRepository } from "@domain/entities/auth/refresh_token_repository";

interface ActiveSessionItem {
  id: string;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

export class ListActiveSessionsUseCase {
  constructor(private refreshTokenRepo: IRefreshTokenRepository) {}

  async execute(userId: string, currentToken?: string): Promise<ActiveSessionItem[]> {
    const tokens = await this.refreshTokenRepo.findByUserId(userId);

    const activeSessions = tokens
      .filter((token) => token.isValid())
      .map((token) => ({
        id: token.id,
        deviceInfo: token.deviceInfo,
        ipAddress: token.ipAddress,
        createdAt: token.createdAt,
        expiresAt: token.expiresAt,
        isCurrent: token.token === currentToken,
      }));

    return activeSessions;
  }
}
