import { describe, expect, it } from "vitest";
import { Discount, DiscountType } from "./discount";

describe("Discount", () => {
  describe("createPercentage", () => {
    it("deve criar desconto percentual válido", () => {
      const discount = Discount.createPercentage(10);
      expect(discount.type).toBe(DiscountType.PERCENTAGE);
      expect(discount.value).toBe(10);
    });

    it("deve criar desconto percentual com valor zero", () => {
      const discount = Discount.createPercentage(0);
      expect(discount.value).toBe(0);
    });

    it("deve criar desconto percentual com valor 100", () => {
      const discount = Discount.createPercentage(100);
      expect(discount.value).toBe(100);
    });

    it("deve lançar erro para valor negativo", () => {
      expect(() => Discount.createPercentage(-1)).toThrow(
        "Percentage discount must be between 0 and 100",
      );
    });

    it("deve lançar erro para valor maior que 100", () => {
      expect(() => Discount.createPercentage(101)).toThrow(
        "Percentage discount must be between 0 and 100",
      );
    });
  });

  describe("createFixed", () => {
    it("deve criar desconto fixo válido", () => {
      const discount = Discount.createFixed(50);
      expect(discount.type).toBe(DiscountType.FIXED);
      expect(discount.value).toBe(50);
    });

    it("deve criar desconto fixo com valor zero", () => {
      const discount = Discount.createFixed(0);
      expect(discount.value).toBe(0);
    });

    it("deve lançar erro para valor negativo", () => {
      expect(() => Discount.createFixed(-1)).toThrow("Fixed discount cannot be negative");
    });
  });

  describe("none", () => {
    it("deve criar desconto none", () => {
      const discount = Discount.none();
      expect(discount.type).toBe(DiscountType.FIXED);
      expect(discount.value).toBe(0);
      expect(discount.isNone()).toBe(true);
    });
  });

  describe("calculateDiscount", () => {
    it("deve calcular desconto percentual", () => {
      const discount = Discount.createPercentage(10);
      expect(discount.calculateDiscount(100)).toBe(10);
      expect(discount.calculateDiscount(50)).toBe(5);
    });

    it("deve calcular desconto fixo", () => {
      const discount = Discount.createFixed(30);
      expect(discount.calculateDiscount(100)).toBe(30);
    });

    it("deve limitar desconto fixo ao valor do amount", () => {
      const discount = Discount.createFixed(150);
      expect(discount.calculateDiscount(100)).toBe(100);
    });
  });

  describe("apply", () => {
    it("deve aplicar desconto percentual", () => {
      const discount = Discount.createPercentage(20);
      expect(discount.apply(100)).toBe(80);
    });

    it("deve aplicar desconto fixo", () => {
      const discount = Discount.createFixed(25);
      expect(discount.apply(100)).toBe(75);
    });

    it("deve retornar valor máximo se desconto maior que amount", () => {
      const discount = Discount.createFixed(150);
      expect(discount.apply(100)).toBe(0);
    });
  });

  describe("isNone", () => {
    it("deve retornar true para desconto none", () => {
      const discount = Discount.none();
      expect(discount.isNone()).toBe(true);
    });

    it("deve retornar false para desconto com valor", () => {
      const discount = Discount.createFixed(10);
      expect(discount.isNone()).toBe(false);
    });
  });
});
