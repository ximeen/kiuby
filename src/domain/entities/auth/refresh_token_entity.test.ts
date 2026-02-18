import { describe, expect, it } from "vitest";
import { RefreshToken } from "./refresh_token_entity";

describe("RefreshToken", () => {
  const createTokenProps = () => ({
    token: "valid-token-123",
    userId: "user-1",
    expiresAt: new Date(Date.now() + 86400000),
  });

  describe("create", () => {
    it("deve criar refresh token válido", () => {
      const token = RefreshToken.create(createTokenProps());
      expect(token.token).toBe("valid-token-123");
      expect(token.userId).toBe("user-1");
      expect(token.isRevoked).toBe(false);
    });

    it("deve criar token com campos opcionais", () => {
      const token = RefreshToken.create({
        ...createTokenProps(),
        deviceInfo: "iPhone 14",
        ipAddress: "192.168.1.1",
      });
      expect(token.deviceInfo).toBe("iPhone 14");
      expect(token.ipAddress).toBe("192.168.1.1");
    });

    it("deve lançar erro para token vazio", () => {
      expect(() => RefreshToken.create({ ...createTokenProps(), token: "" })).toThrow(
        "Token is required",
      );
    });

    it("deve lançar erro para userId vazio", () => {
      expect(() => RefreshToken.create({ ...createTokenProps(), userId: "" })).toThrow(
        "User id is required",
      );
    });

    it("deve lançar erro para expiresAt vazio", () => {
      expect(() =>
        RefreshToken.create({ ...createTokenProps(), expiresAt: undefined as any }),
      ).toThrow("Expiration date is required");
    });
  });

  describe("isExpired", () => {
    it("deve retornar false para token não expirado", () => {
      const token = RefreshToken.create({
        ...createTokenProps(),
        expiresAt: new Date(Date.now() + 86400000),
      });
      expect(token.isExpired()).toBe(false);
    });

    it("deve retornar true para token expirado", () => {
      const token = RefreshToken.create({
        ...createTokenProps(),
        expiresAt: new Date(Date.now() - 1000),
      });
      expect(token.isExpired()).toBe(true);
    });
  });

  describe("isValid", () => {
    it("deve retornar true para token válido", () => {
      const token = RefreshToken.create({
        ...createTokenProps(),
        expiresAt: new Date(Date.now() + 86400000),
      });
      expect(token.isValid()).toBe(true);
    });

    it("deve retornar false para token expirado", () => {
      const token = RefreshToken.create({
        ...createTokenProps(),
        expiresAt: new Date(Date.now() - 1000),
      });
      expect(token.isValid()).toBe(false);
    });

    it("deve retornar false para token revogado", () => {
      const token = RefreshToken.create({
        ...createTokenProps(),
        isRevoked: true,
      });
      expect(token.isValid()).toBe(false);
    });

    it("deve retornar false para token expirado e revogado", () => {
      const token = RefreshToken.create({
        ...createTokenProps(),
        expiresAt: new Date(Date.now() - 1000),
        isRevoked: true,
      });
      expect(token.isValid()).toBe(false);
    });
  });

  describe("revoke", () => {
    it("deve revogar token", () => {
      const token = RefreshToken.create(createTokenProps());
      token.revoke();
      expect(token.isRevoked).toBe(true);
      expect(token.isValid()).toBe(false);
    });
  });
});
