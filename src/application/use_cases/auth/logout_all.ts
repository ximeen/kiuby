import type { IRefreshTokenRepository } from "@domain/entities/auth/refresh_token_repository";

interface LogoutAllInput {
  userId: string;
}

export class LogoutAllUseCase {
  constructor(private refreshTokenRepo: IRefreshTokenRepository) {}

  async execute(input: LogoutAllInput): Promise<void> {
    const tokens = await this.refreshTokenRepo.findByUserId(input.userId);

    for (const token of tokens) {
      token.revoke();
      await this.refreshTokenRepo.update(token);
    }
  }
}
