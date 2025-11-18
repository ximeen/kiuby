import type { IRefreshTokenRepository } from "@domain/entities/auth/refresh_token_repository";
import type { IUserRepository } from "@domain/entities/user/user_repository";
import { NotFoundError, UnauthorizedError } from "@shared/errors/domain_error";
import { generateToken } from "@shared/utils/jwt";

interface RefreshTokenInput {
  refreshToken: string;
}

interface RefreshTokenOutput {
  accessToken: string;
  expireIn: number;
}

export class RefreshTokenUseCase {
  constructor(
    private refreshTokenRepo: IRefreshTokenRepository,
    private userRepo: IUserRepository,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const refreshToken = await this.refreshTokenRepo.findByToken(input.refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (!refreshToken.isValid()) {
      throw new UnauthorizedError("Refresh token expired or revoked");
    }

    const user = await this.userRepo.findById(refreshToken.userId);

    if (!user) {
      throw new NotFoundError("User", refreshToken.userId);
    }

    if (!user.isActive()) {
      throw new UnauthorizedError("User is not active");
    }

    if (user.isBlocked()) {
      throw new UnauthorizedError("User is blocked");
    }

    const accessToken = generateToken({
      userId: user.id,
      username: user.username.value,
      role: user.role,
      permissions: user.getPermissions(),
    });

    return {
      accessToken,
      expireIn: 900,
    };
  }
}
