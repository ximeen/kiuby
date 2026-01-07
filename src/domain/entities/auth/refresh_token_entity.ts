import { Entity } from "@domain/shared/entity";
import { ValidationError } from "@shared/errors/domain_error";

interface RefreshTokenProps {
  token: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
  deviceInfo?: string;
  ipAddress?: string;
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  private constructor(props: RefreshTokenProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<RefreshTokenProps, "isRevoked"> & { isRevoked?: boolean },
    id?: string,
  ): RefreshToken {
    if (!props.token) {
      throw new ValidationError("Token is required");
    }

    if (!props.userId) {
      throw new ValidationError("User id is required");
    }

    if (!props.expiresAt) {
      throw new ValidationError("Expiration date is required");
    }

    return new RefreshToken(
      {
        ...props,
        isRevoked: props.isRevoked ?? false,
      },
      id,
    );
  }

  get token(): string {
    return this.props.token;
  }

  get userId(): string {
    return this.props.userId;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get isRevoked(): boolean {
    return this.props.isRevoked;
  }

  get deviceInfo(): string | undefined {
    return this.props.deviceInfo;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  isValid(): boolean {
    return !this.props.isRevoked && !this.isExpired();
  }

  revoke(): void {
    this.props.isRevoked = true;
    this.touch();
  }
}
