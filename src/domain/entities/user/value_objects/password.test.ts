import { describe, expect, it } from "vitest";
import { Password } from "./password";

describe("Password", () => {
  describe("create", () => {
    it("deve criar password com senha válida", async () => {
      const password = await Password.create("Teste123!");
      expect(password.hash).toBeDefined();
      expect(password.hash).not.toBe("Teste123!");
    });

    it("deve lançar erro para senha vazia", async () => {
      await expect(Password.create("")).rejects.toThrow("Password cannot be empty");
    });

    it("deve lançar erro para senha muito curta", async () => {
      await expect(Password.create("Ab1!")).rejects.toThrow(
        "Password must be at least 8 characters long",
      );
    });

    it("deve lançar erro para senha sem minúscula", async () => {
      await expect(Password.create("TESTE123!")).rejects.toThrow(
        "Password must contain at least one lowercase letter",
      );
    });

    it("deve lançar erro para senha sem maiúscula", async () => {
      await expect(Password.create("teste123!")).rejects.toThrow(
        "Password must contain at least one uppercase letter",
      );
    });

    it("deve lançar erro para senha sem número", async () => {
      await expect(Password.create("TesteSenha!")).rejects.toThrow(
        "Password must contain at least one number",
      );
    });

    it("deve lançar erro para senha sem caractere especial", async () => {
      await expect(Password.create("Teste1234")).rejects.toThrow(
        "Password must contain at least one special character",
      );
    });
  });

  describe("fromHash", () => {
    it("deve criar password a partir de hash existente", () => {
      const existingHash = "$2b$10$existinghash";
      const password = Password.fromHash(existingHash);
      expect(password.hash).toBe(existingHash);
    });
  });

  describe("verify", () => {
    it("deve retornar true para senha correta", async () => {
      const password = await Password.create("Teste123!");
      const isValid = await password.verify("Teste123!");
      expect(isValid).toBe(true);
    });

    it("deve retornar false para senha incorreta", async () => {
      const password = await Password.create("Teste123!");
      const isValid = await password.verify("SenhaErrada");
      expect(isValid).toBe(false);
    });
  });
});
