import { describe, expect, it } from "vitest";
import { Quantity } from "./quantity";

describe("Quantity", () => {
  describe("create", () => {
    it("deve criar quantity com valor válido", () => {
      const quantity = Quantity.create(10);
      expect(quantity.value).toBe(10);
    });

    it("deve criar quantity com valor zero", () => {
      const quantity = Quantity.create(0);
      expect(quantity.value).toBe(0);
    });

    it("deve criar quantity com valor decimal", () => {
      const quantity = Quantity.create(5.5);
      expect(quantity.value).toBe(5.5);
    });

    it("deve lançar erro para valor negativo", () => {
      expect(() => Quantity.create(-1)).toThrow("Quantity cannot be negative");
    });

    it("deve lançar erro para valor não finito", () => {
      expect(() => Quantity.create(Infinity)).toThrow("Quantity must be a finite number");
      expect(() => Quantity.create(NaN)).toThrow("Quantity must be a finite number");
    });
  });

  describe("zero", () => {
    it("deve criar quantity com valor zero", () => {
      const quantity = Quantity.zero();
      expect(quantity.value).toBe(0);
      expect(quantity.isZero()).toBe(true);
    });
  });

  describe("add", () => {
    it("deve somar duas quantities", () => {
      const q1 = Quantity.create(5);
      const q2 = Quantity.create(3);
      const result = q1.add(q2);
      expect(result.value).toBe(8);
    });
  });

  describe("subtract", () => {
    it("deve subtrair duas quantities", () => {
      const q1 = Quantity.create(10);
      const q2 = Quantity.create(3);
      const result = q1.subtract(q2);
      expect(result.value).toBe(7);
    });

    it("deve lançar erro se resultado for negativo", () => {
      const q1 = Quantity.create(3);
      const q2 = Quantity.create(5);
      expect(() => q1.subtract(q2)).toThrow("Cannot subtract: result would be negative");
    });
  });

  describe("isZero", () => {
    it("deve retornar true para quantity zero", () => {
      const quantity = Quantity.zero();
      expect(quantity.isZero()).toBe(true);
    });

    it("deve retornar false para quantity diferente de zero", () => {
      const quantity = Quantity.create(5);
      expect(quantity.isZero()).toBe(false);
    });
  });

  describe("isGreaterThan", () => {
    it("deve retornar true se quantity for maior", () => {
      const q1 = Quantity.create(10);
      const q2 = Quantity.create(5);
      expect(q1.isGreaterThan(q2)).toBe(true);
    });

    it("deve retornar false se quantity for menor ou igual", () => {
      const q1 = Quantity.create(5);
      const q2 = Quantity.create(10);
      expect(q1.isGreaterThan(q2)).toBe(false);
      expect(q1.isGreaterThan(Quantity.create(5))).toBe(false);
    });
  });

  describe("isLessThan", () => {
    it("deve retornar true se quantity for menor", () => {
      const q1 = Quantity.create(5);
      const q2 = Quantity.create(10);
      expect(q1.isLessThan(q2)).toBe(true);
    });

    it("deve retornar false se quantity for maior ou igual", () => {
      const q1 = Quantity.create(10);
      const q2 = Quantity.create(5);
      expect(q1.isLessThan(q2)).toBe(false);
      expect(q1.isLessThan(Quantity.create(10))).toBe(false);
    });
  });

  describe("isSufficientFor", () => {
    it("deve retornar true se quantity for suficiente", () => {
      const quantity = Quantity.create(10);
      const required = Quantity.create(5);
      expect(quantity.isSufficientFor(required)).toBe(true);
    });

    it("deve retornar false se quantity não for suficiente", () => {
      const quantity = Quantity.create(3);
      const required = Quantity.create(5);
      expect(quantity.isSufficientFor(required)).toBe(false);
    });

    it("deve retornar true se quantity for igual ao requerido", () => {
      const quantity = Quantity.create(5);
      const required = Quantity.create(5);
      expect(quantity.isSufficientFor(required)).toBe(true);
    });
  });
});
