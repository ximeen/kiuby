import type { IRefreshTokenRepository } from "@domain/entities/auth/refresh_token_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface LogoutInput {
  refreshToken: string;
}

export class LogoutUseCase {
  constructor(private refreshToken: IRefreshTokenRepository) {}

  async execute(input: LogoutInput): Promise<void> {
    const refreshToken = await this.refreshToken.findByToken(input.refreshToken);

    if (!refreshToken) {
      throw new NotFoundError("Refresh token", input.refreshToken);
    }

    refreshToken.revoke();
    await this.refreshToken.update(refreshToken);
  }
}
