import { describe, expect, it } from "vitest";
import { Money } from "./money";

describe("Money", () => {
  describe("Create", () => {
    it("Deve criar Money com BRL como moeda padrão", () => {
      const money = Money.create(100);

      expect(money.amount).toBe(100);
      expect(money.currency).toBe("BRL");
    });

    it("Deve criar Money com moeda especifíca", () => {
      const money = Money.create(100, "USD");

      expect(money.amount).toBe(100);
      expect(money.currency).toBe("USD");
    });

    it("Deve permitir criar Money com valor zero", () => {
      const money = Money.create(0);
      expect(money.amount).toBe(0);
    });

    it("Deve lançar erro ao tentar criar com valor negativo", () => {
      expect(() => Money.create(-10)).toThrow("Amount cannot be negative");
      expect(() => Money.create(-0.1, "USD")).toThrow("Amount cannot be negative");
    });
  });

  describe("Add", () => {
    it("Deve somar valores da mesma moeda", () => {
      const money_01 = Money.create(100, "BRL");
      const money_02 = Money.create(200, "BRL");

      const result = money_01.add(money_02);

      expect(result.amount).toBe(300);
      expect(result.currency).toBe("BRL");
    });
    it("Deve lançar erro ao tentar somar moedas diferentes", () => {
      const money_brl = Money.create(100, "BRL");
      const money_usd = Money.create(200, "USD");

      expect(() => money_brl.add(money_usd)).toThrow("Cannot operate on different currencies");
    });

    it("Deve manter valores originais inalterados (imutabilidade)", () => {
      const money_01 = Money.create(100, "BRL");
      const money_02 = Money.create(200, "BRL");

      money_01.add(money_02);

      expect(money_01.amount).toBe(100);
      expect(money_02.amount).toBe(200);
    });
  });

  describe("Subtract", () => {
    it("Deve subtrair valores da mesma moeda", () => {
      const money_01 = Money.create(100, "BRL");
      const money_02 = Money.create(200, "BRL");

      const result = money_02.subtract(money_01);
      expect(result.amount).toBe(100);
      expect(result.currency).toBe("BRL");
    });

    it("Deve lançar erro ao tentar subtrair moedas diferentes", () => {
      const money_brl = Money.create(100, "BRL");
      const money_usd = Money.create(200, "USD");

      expect(() => money_brl.subtract(money_usd)).toThrow("Cannot operate on different currencies");
    });

    it("Deve lançar erro se o resultado for negativo", () => {
      const money_01 = Money.create(100, "BRL");
      const money_02 = Money.create(200, "BRL");

      expect(() => money_01.subtract(money_02)).toThrow("Amount cannot be negative");
    });

    it("Deve permitir subtração que resulte em zero", () => {
      const money_01 = Money.create(100);
      const money_02 = Money.create(100);

      const result = money_01.subtract(money_02);

      expect(result.amount).toBe(0);
    });
  });

  describe("Multiply", () => {
    it("Deve multiplicar valor por inteiro", () => {
      const money = Money.create(50);

      const result = money.multiply(3);
      expect(result.amount).toBe(150);
      expect(result.currency).toBe("BRL");
    });

    it("Deve multiplicar valor por decimal", () => {
      const money = Money.create(100);

      const result = money.multiply(1.5);

      expect(result.amount).toBe(150);
    });

    it("Deve multiplicar por zero", () => {
      const money = Money.create(100);

      const result = money.multiply(0);

      expect(result.amount).toBe(0);
    });

    it("Deve lançar erro ao multiplicar por número negativo", () => {
      const money = Money.create(100);

      expect(() => money.multiply(-2)).toThrow("Amount cannot be negative");
    });

    it("Deve manter moeda original após multiplicar", () => {
      const money = Money.create(50, "USD");

      const result = money.multiply(2);
      expect(result.currency).toBe("USD");
    });
  });

  describe("Is Greater Than", () => {
    it("Deve retornar true quando valor for maior", () => {
      const money_01 = Money.create(100);
      const money_02 = Money.create(50);

      expect(money_01.isGreaterThan(money_02)).toBe(true);
    });

    it("Deve retornar false quando o valor for menor", () => {
      const money_01 = Money.create(50);
      const money_02 = Money.create(100);

      expect(money_01.isGreaterThan(money_02)).toBe(false);
    });

    it("Deve retornar false quando valores forem iguais", () => {
      const money_01 = Money.create(100);
      const money_02 = Money.create(100);

      expect(money_01.isGreaterThan(money_02)).toBe(false);
    });

    it("Deve lançar erro ao comparar moedas diferentes", () => {
      const brl = Money.create(100, "BRL");
      const usd = Money.create(50, "USD");

      expect(() => brl.isGreaterThan(usd)).toThrow("Cannot operate on different currencies");
    });
  });

  describe("Igualdade", () => {
    it("Deve considerar iguais Money com mesmo valor e moeda", () => {
      const money_01 = Money.create(100, "BRL");
      const money_02 = Money.create(100, "BRL");

      expect(money_01.equals(money_02)).toBe(true);
    });

    it("Deve considerar diferentes Money com moedas diferentes", () => {
      const money_01 = Money.create(100, "BRL");
      const money_02 = Money.create(100, "USD");

      expect(money_01.equals(money_02)).toBe(false);
    });
  });

  describe("Casos de usos reais", () => {
    it("Deve calcular desconto percentual", () => {
      const price = Money.create(100);
      const discount = price.multiply(0.1);
      const totalPrice = price.subtract(discount);

      expect(totalPrice.amount).toBe(90);
    });

    it("Deve calcular total de itens", () => {
      const unitPrice = Money.create(25.5);
      const total = unitPrice.multiply(4);

      expect(total.amount).toBe(102);
    });

    it("Deve verificar se tem saldo suficiente", () => {
      const amount = Money.create(100);
      const value = Money.create(150);

      expect(amount.isGreaterThan(value)).toBe(false);
    });
  });
});
