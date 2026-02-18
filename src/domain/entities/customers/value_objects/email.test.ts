import { describe, expect, it } from "vitest";
import { Email } from "./email";

describe("Email", () => {
  describe("create", () => {
    it("deve criar email com valor válido", () => {
      const email = Email.create("test@example.com");
      expect(email.value).toBe("test@example.com");
    });

    it("deve converter para minúsculas", () => {
      const email = Email.create("TEST@EXAMPLE.COM");
      expect(email.value).toBe("test@example.com");
    });

    it("deve remover espaços em branco", () => {
      const email = Email.create("  test@example.com  ");
      expect(email.value).toBe("test@example.com");
    });

    it("deve criar email com subdomínio", () => {
      const email = Email.create("test@mail.example.com");
      expect(email.value).toBe("test@mail.example.com");
    });

    it("deve criar email com plus addressing", () => {
      const email = Email.create("test+tag@example.com");
      expect(email.value).toBe("test+tag@example.com");
    });

    it("deve lançar erro para email vazio", () => {
      expect(() => Email.create("")).toThrow("Email cannot be empty");
    });

    it("deve lançar erro para email apenas com espaços", () => {
      expect(() => Email.create("   ")).toThrow("Email cannot be empty");
    });

    it("deve lançar erro para email sem @", () => {
      expect(() => Email.create("testexample.com")).toThrow("Invalid email format");
    });

    it("deve lançar erro para email sem domínio", () => {
      expect(() => Email.create("test@")).toThrow("Invalid email format");
    });

    it("deve lançar erro para email sem局部", () => {
      expect(() => Email.create("@example.com")).toThrow("Invalid email format");
    });

    it("deve lançar erro para email com espaços", () => {
      expect(() => Email.create("test @example.com")).toThrow("Invalid email format");
    });
  });

  describe("getDomain", () => {
    it("deve retornar domínio do email", () => {
      const email = Email.create("test@example.com");
      expect(email.getDomain()).toBe("example.com");
    });

    it("deve retornar subdomínio", () => {
      const email = Email.create("test@mail.example.com");
      expect(email.getDomain()).toBe("mail.example.com");
    });
  });
});
