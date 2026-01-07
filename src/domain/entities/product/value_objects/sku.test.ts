import { describe, expect, it } from "vitest";
import { SKU } from "./sku";

describe("SKU", () => {
  describe("Create", () => {
    it("Deve criar SKU com valor válido", () => {
      const sku = SKU.create("PROD-01");

      expect(sku.value).toBe("PROD-01");
    });

    it("Deve converter para maiúscula", () => {
      const sku = SKU.create("prod-01");

      expect(sku.value).toBe("PROD-01");
    });

    it("Deve remover os espaços extras e converter para maiúscula", () => {
      const sku = SKU.create("   prod-001  ");

      expect(sku.value).toBe("PROD-001");
    });

    it("Deve aceitar SKU com exatamente 3 caracters", () => {
      const sku = SKU.create("ABC");

      expect(sku.value).toBe("ABC");
    });

    it("Deve aceitar SKU com 50 caracters", () => {
      const longSku = "A".repeat(50);

      const sku = SKU.create(longSku);

      expect(sku.value).toBe(longSku);
    });

    it("Deve aceitar apenas números", () => {
      const sku = SKU.create("123456");

      expect(sku.value).toBe("123456");
    });

    it("Deve acietar apenas letras", () => {
      const sku = SKU.create("ABCDE");

      expect(sku.value).toBe("ABCDE");
    });

    it("deve aceitar hífens", () => {
      const sku = SKU.create("PROD-ABC-123");

      expect(sku.value).toBe("PROD-ABC-123");
    });

    it("deve aceitar underscores", () => {
      const sku = SKU.create("PROD_ABC_123");

      expect(sku.value).toBe("PROD_ABC_123");
    });

    it("deve aceitar combinação de caracteres válidos", () => {
      const sku = SKU.create("PROD-2024_V1");

      expect(sku.value).toBe("PROD-2024_V1");
    });
  });

  describe("validações de erro", () => {
    it("deve lançar erro se SKU estiver vazio", () => {
      expect(() => SKU.create("")).toThrow("SKU cannot be empty");
    });

    it("deve lançar erro se SKU tiver apenas espaços", () => {
      expect(() => SKU.create("   ")).toThrow("SKU cannot be empty");
    });

    it("deve lançar erro se SKU tiver menos de 3 caracteres", () => {
      expect(() => SKU.create("AB")).toThrow("SKU must be between 3 and 50 characters");
      expect(() => SKU.create("A")).toThrow("SKU must be between 3 and 50 characters");
    });

    it("deve lançar erro se SKU tiver mais de 50 caracteres", () => {
      const longSku = "A".repeat(51);

      expect(() => SKU.create(longSku)).toThrow("SKU must be between 3 and 50 characters");
    });

    it("deve lançar erro se conter espaços no meio", () => {
      expect(() => SKU.create("PROD 001")).toThrow(
        "SKU can only contain letters, numbers, hyphens and underscores",
      );
    });

    it("deve lançar erro se conter caracteres especiais inválidos", () => {
      expect(() => SKU.create("PROD@001")).toThrow(
        "SKU can only contain letters, numbers, hyphens and underscores",
      );
      expect(() => SKU.create("PROD#001")).toThrow(
        "SKU can only contain letters, numbers, hyphens and underscores",
      );
      expect(() => SKU.create("PROD.001")).toThrow(
        "SKU can only contain letters, numbers, hyphens and underscores",
      );
      expect(() => SKU.create("PROD/001")).toThrow(
        "SKU can only contain letters, numbers, hyphens and underscores",
      );
    });

    it("deve lançar erro se conter letras acentuadas", () => {
      expect(() => SKU.create("PRODÁ001")).toThrow(
        "SKU can only contain letters, numbers, hyphens and underscores",
      );
    });

    it("deve lançar erro se conter letras minúsculas com caracteres inválidos", () => {
      expect(() => SKU.create("prod@001")).toThrow(
        "SKU can only contain letters, numbers, hyphens and underscores",
      );
    });
  });

  describe("igualdade (ValueObject)", () => {
    it("deve considerar iguais SKUs com mesmo valor", () => {
      const sku1 = SKU.create("PROD-001");
      const sku2 = SKU.create("PROD-001");

      expect(sku1.equals(sku2)).toBe(true);
    });

    it("deve considerar iguais SKUs após normalização", () => {
      const sku1 = SKU.create("PROD-001");
      const sku2 = SKU.create("  prod-001  ");

      expect(sku1.equals(sku2)).toBe(true);
    });

    it("deve considerar iguais SKUs case-insensitive", () => {
      const sku1 = SKU.create("PROD-001");
      const sku2 = SKU.create("prod-001");
      const sku3 = SKU.create("PrOd-001");

      expect(sku1.equals(sku2)).toBe(true);
      expect(sku1.equals(sku3)).toBe(true);
    });

    it("deve considerar diferentes SKUs com valores diferentes", () => {
      const sku1 = SKU.create("PROD-001");
      const sku2 = SKU.create("PROD-002");

      expect(sku1.equals(sku2)).toBe(false);
    });
  });

  describe("casos limite", () => {
    it("deve aceitar SKU com apenas 3 caracteres após normalização", () => {
      const sku = SKU.create("  abc  ");

      expect(sku.value).toBe("ABC");
      expect(sku.value.length).toBe(3);
    });

    it("deve aceitar múltiplos hífens e underscores", () => {
      const sku = SKU.create("A-B_C-D_E");

      expect(sku.value).toBe("A-B_C-D_E");
    });

    it("deve aceitar SKU começando com número", () => {
      const sku = SKU.create("123ABC");

      expect(sku.value).toBe("123ABC");
    });

    it("deve aceitar SKU terminando com hífen", () => {
      const sku = SKU.create("PROD-");

      expect(sku.value).toBe("PROD-");
    });

    it("deve aceitar SKU terminando com underscore", () => {
      const sku = SKU.create("PROD_");

      expect(sku.value).toBe("PROD_");
    });

    it("deve rejeitar no limite máximo +1", () => {
      const longSku = "A".repeat(51);

      expect(() => SKU.create(longSku)).toThrow("SKU must be between 3 and 50 characters");
    });

    it("deve normalizar e validar tamanho corretamente", () => {
      const sku = SKU.create(`  ${"A".repeat(50)}  `);

      expect(sku.value.length).toBe(50);
    });
  });

  describe("padrões comuns de SKU", () => {
    it("deve aceitar padrão CATEGORIA-CODIGO", () => {
      const sku = SKU.create("ELET-12345");

      expect(sku.value).toBe("ELET-12345");
    });

    it("deve aceitar padrão PREFIXO_ANO_SEQUENCIAL", () => {
      const sku = SKU.create("PROD_2024_001");

      expect(sku.value).toBe("PROD_2024_001");
    });

    it("deve aceitar código de barras simplificado", () => {
      const sku = SKU.create("7891234567890");

      expect(sku.value).toBe("7891234567890");
    });

    it("deve aceitar padrão misto complexo", () => {
      const sku = SKU.create("CAT-A1B2-2024_V3");

      expect(sku.value).toBe("CAT-A1B2-2024_V3");
    });
  });
});
