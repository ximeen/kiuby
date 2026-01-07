import { describe, expect, it } from "vitest";
import { ProductName } from "./product_name";

describe("ProductName", () => {
  describe("Create", () => {
    it("Deve criar um ProductName com valor válido", () => {
      const name = ProductName.create("Notebook");

      expect(name.value).toBe("Notebook");
    });

    it("Deve remover espaços extras no inicio e no fim", () => {
      const name = ProductName.create("  Mouse gamer   ");

      expect(name.value).toBe("Mouse gamer");
    });

    it("Deve aceitar o nome com exatamente 3 caractereres", () => {
      const name = ProductName.create("USB");

      expect(name.value).toBe("USB");
    });

    it("Deve aceitar o nome com 200 caracteres", () => {
      const longName = "A".repeat(200);

      const name = ProductName.create(longName);

      expect(name.value).toBe(longName);
      expect(name.value.length).toBe(200);
    });

    it("Deve aceitar nomes com caracteres especiais", () => {
      const name = ProductName.create("Café 100% ");
      expect(name.value).toBe("Café 100%");
    });
    it("Deve aceitar nomes com números", () => {
      const name = ProductName.create("Iphone 15 PRO");
      expect(name.value).toBe("Iphone 15 PRO");
    });
  });

  describe("Validações de erros", () => {
    it("Deve lançar erro se o nome estiver vazio", () => {
      expect(() => ProductName.create("")).toThrow("Product name cannot be empty");
    });

    it("Deve lançar erro se o nome tiver apenas espaços", () => {
      expect(() => ProductName.create("  ")).toThrow("Product name cannot be empty");
    });

    it("Deve lançar erro se o nome tiver menos de 3 caracteres", () => {
      expect(() => ProductName.create("AB")).toThrow("Product name must be at least 3 characters");
      expect(() => ProductName.create("A")).toThrow("Product name must be at least 3 characters");
    });
    it("Deve lançar erro se o nome tiver mais de 200 caracteres", () => {
      const longName = "A".repeat(201);

      expect(() => ProductName.create(longName)).toThrow(
        "Product name cannot exceed 200 characters",
      );
    });

    it("Deve lançar erro se o nome tiver espaços mas menos de 3 caracters após o trim", () => {
      expect(() => ProductName.create("   A    ")).toThrow(
        "Product name must be at least 3 characters",
      );
    });
  });

  describe("Igualdade", () => {
    it("Deve considerar iguais nomes com mesmo valor", () => {
      const name_01 = ProductName.create("Produto teste");
      const name_02 = ProductName.create("Produto teste");

      expect(name_01.equals(name_02)).toBe(true);
    });
    it("Deve considerar iguais nomes após normalização", () => {
      const name_01 = ProductName.create("Produto teste");
      const name_02 = ProductName.create("   Produto teste    ");

      expect(name_01.equals(name_02)).toBe(true);
    });

    it("Deve considerar diferentes nomes com valores diferentes", () => {
      const name_01 = ProductName.create("Produto A");
      const name_02 = ProductName.create("Produto B");

      expect(name_01.equals(name_02)).toBe(false);
    });

    it("Deve ser case sensitive", () => {
      const name_01 = ProductName.create("Produto");
      const name_02 = ProductName.create("produto");

      expect(name_01.equals(name_02)).toBe(false);
    });
  });

  describe("Casos limite", () => {
    it("Deve aceitar nome com apenas 3 letras maiusculas", () => {
      const name = ProductName.create("AMD");

      expect(name.value).toBe("AMD");
    });

    it("Deve aceitar nomes com multiplos espaços internos", () => {
      const name = ProductName.create("Produto  Muito  Espaçado");
      expect(name.value).toBe("Produto  Muito  Espaçado");
    });

    it("Deve aceitar caracters unicode", () => {
      const name = ProductName.create("Açúcar Cristal ™");

      expect(name.value).toBe("Açúcar Cristal ™");
    });

    it("Deve aceitar nome no limite mínimo após o trim", () => {
      const name = ProductName.create("   ABC       ");

      expect(name.value).toBe("ABC");
      expect(name.value.length).toBe(3);
    });

    it("Deve rejeitar nome no limite máximo +1 após o trim", () => {
      const longName = `  ${"A".repeat(201)}  `;

      expect(() => ProductName.create(longName)).toThrow(
        "Product name cannot exceed 200 characters",
      );
    });
  });
});
