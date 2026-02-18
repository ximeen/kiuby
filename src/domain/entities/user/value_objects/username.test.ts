import { describe, expect, it } from "vitest";
import { Username } from "./username";

describe("Username", () => {
  describe("create", () => {
    it("deve criar username com valor válido", () => {
      const username = Username.create("john_doe");
      expect(username.value).toBe("john_doe");
    });

    it("deve converter para minúsculas", () => {
      const username = Username.create("JohnDoe");
      expect(username.value).toBe("johndoe");
    });

    it("deve remover espaços em branco", () => {
      const username = Username.create("  johndoe  ");
      expect(username.value).toBe("johndoe");
    });

    it("deve aceitar username com pontos, hífens e underscores", () => {
      const username = Username.create("john.doe_123");
      expect(username.value).toBe("john.doe_123");
    });

    it("deve lançar erro para username vazio", () => {
      expect(() => Username.create("")).toThrow("Usename cannot be empty");
    });

    it("deve lançar erro para username com apenas espaços", () => {
      expect(() => Username.create("   ")).toThrow("Usename cannot be empty");
    });

    it("deve lançar erro para username com menos de 3 caracteres", () => {
      expect(() => Username.create("ab")).toThrow("Username must be at least 3 characters");
    });

    it("deve lançar erro para username com mais de 50 caracteres", () => {
      const longName = "a".repeat(51);
      expect(() => Username.create(longName)).toThrow("Username cannot exceed 50 characters");
    });

    it("deve lançar erro para username com caracteres inválidos", () => {
      expect(() => Username.create("john@doe")).toThrow(
        "Username can only contain lowercase letters, numbers, dots, hyphens and undescores",
      );
      expect(() => Username.create("john doe")).toThrow(
        "Username can only contain lowercase letters, numbers, dots, hyphens and undescores",
      );
    });

    it("deve lançar erro para username começando com especial", () => {
      expect(() => Username.create(".johndoe")).toThrow(
        "Username cannot start or end with special characters",
      );
      expect(() => Username.create("_johndoe")).toThrow(
        "Username cannot start or end with special characters",
      );
      expect(() => Username.create("-johndoe")).toThrow(
        "Username cannot start or end with special characters",
      );
    });

    it("deve lançar erro para username terminando com especial", () => {
      expect(() => Username.create("johndoe.")).toThrow(
        "Username cannot start or end with special characters",
      );
      expect(() => Username.create("johndoe_")).toThrow(
        "Username cannot start or end with special characters",
      );
      expect(() => Username.create("johndoe-")).toThrow(
        "Username cannot start or end with special characters",
      );
    });
  });
});
