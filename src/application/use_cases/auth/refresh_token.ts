import { RefreshToken } from "@domain/entities/auth/refresh_token_entity";
import type { IRefreshTokenRepository } from "@domain/entities/auth/refresh_token_repository";
import type { IUserRepository } from "@domain/entities/user/user_repository";
import { NotFoundError, UnauthorizedError } from "@shared/errors/domain_error";
import { generateRefreshToken, generateToken, getRefreshTokenExpiration } from "@shared/utils/jwt";

interface RefreshTokenInput {
  refreshToken: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
  expireIn: number;
}

export class RefreshTokenUseCase {
  constructor(
    private refreshTokenRepo: IRefreshTokenRepository,
    private userRepo: IUserRepository,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const oldRefreshToken = await this.refreshTokenRepo.findByToken(input.refreshToken);

    if (!oldRefreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (!oldRefreshToken.isValid()) {
      throw new UnauthorizedError("Refresh token expired or revoked");
    }

    const user = await this.userRepo.findById(oldRefreshToken.userId);

    if (!user) {
      throw new NotFoundError("User", oldRefreshToken.userId);
    }

    if (!user.isActive()) {
      throw new UnauthorizedError("User is not active");
    }

    if (user.isBlocked()) {
      throw new UnauthorizedError("User is blocked");
    }

    oldRefreshToken.revoke();
    await this.refreshTokenRepo.update(oldRefreshToken);

    const accessToken = generateToken({
      userId: user.id,
      username: user.username.value,
      role: user.role,
      permissions: user.getPermissions(),
    });

    const newRefreshTokenValue = generateRefreshToken();
    const newRefreshToken = RefreshToken.create({
      token: newRefreshTokenValue,
      userId: user.id,
      expiresAt: getRefreshTokenExpiration(),
      deviceInfo: input.deviceInfo || oldRefreshToken.deviceInfo,
      ipAddress: input.ipAddress || oldRefreshToken.ipAddress,
    });

    await this.refreshTokenRepo.save(newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshTokenValue,
      expireIn: 900,
    };
  }
}
