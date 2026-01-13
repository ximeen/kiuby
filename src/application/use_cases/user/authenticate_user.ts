import { RefreshToken } from "@domain/entities/auth/refresh_token_entity";
import type { IRefreshTokenRepository } from "@domain/entities/auth/refresh_token_repository";
import type { Permission } from "@domain/entities/user/permissions";
import type { IUserRepository } from "@domain/entities/user/user_repository";
import { UnauthorizedError } from "@shared/errors/domain_error";
import { generateRefreshToken, generateToken, getRefreshTokenExpiration } from "@shared/utils/jwt";

interface AuthenticateInput {
  username: string;
  password: string;
  deviceInfo?: string;
  ipAddress?: string;
}

export interface AuthenticateOutput {
  accessToken: string;
  refreshToken: string;
  expireIn: number;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    role: string;
    permissions: Permission[];
  };
}

export class AuthenticateUserUseCase {
  constructor(
    private userRepo: IUserRepository,
    private refreshTokenRepo: IRefreshTokenRepository,
  ) {}

  async execute(input: AuthenticateInput): Promise<AuthenticateOutput> {
    console.log("🔍 Buscando user:", input.username);
    const user = await this.userRepo.findByUsername(input.username);

    console.log("👤 User encontrado:", user?.id, user?.username.value);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    if (!user.isActive()) {
      throw new UnauthorizedError("User is not active");
    }

    if (user.isBlocked()) {
      throw new UnauthorizedError("User is blocked");
    }

    if (!(await user.verifyPassword(input.password))) {
      throw new UnauthorizedError("Invalid credentials");
    }

    user.recordLogin();

    await this.userRepo.update(user);

    const permissions = user.getPermissions();
    const accessToken = generateToken({
      userId: user.id,
      username: user.username.value,
      role: user.role,
      permissions,
    });

    const refreshTokenValue = generateRefreshToken();
    const refreshToken = RefreshToken.create({
      token: refreshTokenValue,
      userId: user.id,
      expiresAt: getRefreshTokenExpiration(),
      deviceInfo: input.deviceInfo,
      ipAddress: input.ipAddress,
    });

    await this.refreshTokenRepo.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      expireIn: 900,
      user: {
        id: user.id,
        name: user.name,
        username: user.username.value,
        email: user.email.value,
        role: user.role,
        permissions,
      },
    };
  }
}
