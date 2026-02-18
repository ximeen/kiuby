import { beforeEach, describe, expect, it } from "vitest";
import { Stock, StockStatus } from "./stock_entity";
import { Quantity } from "./value_objects/quantity";

describe("Stock", () => {
  let validProps: Parameters<typeof Stock.create>[0];

  beforeEach(() => {
    validProps = {
      productId: "product-1",
      warehouseId: "warehouse-1",
      quantity: Quantity.create(100),
    };
  });

  describe("create", () => {
    it("deve criar stock com status ACTIVE por padrão", () => {
      const stock = Stock.create(validProps);
      expect(stock.status).toBe(StockStatus.ACTIVE);
      expect(stock.isActive()).toBe(true);
    });

    it("deve criar stock com status específico", () => {
      const stock = Stock.create({ ...validProps, status: StockStatus.INACTIVE });
      expect(stock.status).toBe(StockStatus.INACTIVE);
    });

    it("deve criar stock com reservedQuantity zerado por padrão", () => {
      const stock = Stock.create(validProps);
      expect(stock.reservedQuantity.value).toBe(0);
    });

    it("deve criar stock com reservedQuantity específico", () => {
      const stock = Stock.create({
        ...validProps,
        reservedQuantity: Quantity.create(20),
      });
      expect(stock.reservedQuantity.value).toBe(20);
    });
  });

  describe("getAvailableQuantity", () => {
    it("deve retornar quantidade disponível", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(100),
        reservedQuantity: Quantity.create(30),
      });
      expect(stock.getAvailableQuantity().value).toBe(70);
    });
  });

  describe("hasAvailableQuantity", () => {
    it("deve retornar true se tiver quantidade disponível", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(100),
        reservedQuantity: Quantity.create(30),
      });
      expect(stock.hasAvailableQuantity(Quantity.create(70))).toBe(true);
    });

    it("deve retornar false se não tiver quantidade disponível", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(100),
        reservedQuantity: Quantity.create(30),
      });
      expect(stock.hasAvailableQuantity(Quantity.create(71))).toBe(false);
    });
  });

  describe("addQuantity", () => {
    it("deve adicionar quantidade", () => {
      const stock = Stock.create(validProps);
      stock.addQuantity(Quantity.create(50));
      expect(stock.quantity.value).toBe(150);
    });

    it("deve lançar erro se stock estiver inativo", () => {
      const stock = Stock.create({ ...validProps, status: StockStatus.INACTIVE });
      expect(() => stock.addQuantity(Quantity.create(50))).toThrow(
        "Cannot add quantity to inactive stock",
      );
    });
  });

  describe("removeQuantity", () => {
    it("deve remover quantidade", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(100),
      });
      stock.removeQuantity(Quantity.create(30));
      expect(stock.quantity.value).toBe(70);
    });

    it("deve lançar erro se quantidade insuficiente", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(50),
      });
      expect(() => stock.removeQuantity(Quantity.create(100))).toThrow(
        "Insufficient available stock",
      );
    });

    it("deve lançar erro se stock estiver inativo", () => {
      const stock = Stock.create({ ...validProps, status: StockStatus.INACTIVE });
      expect(() => stock.removeQuantity(Quantity.create(10))).toThrow(
        "Cannot remove quantity from inactive stock",
      );
    });
  });

  describe("reserve", () => {
    it("deve reservar quantidade", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(100),
      });
      stock.reserve(Quantity.create(30));
      expect(stock.reservedQuantity.value).toBe(30);
    });

    it("deve lançar erro se quantidade insuficiente para reserva", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(50),
        reservedQuantity: Quantity.create(40),
      });
      expect(() => stock.reserve(Quantity.create(20))).toThrow(
        "Insufficient available quantity to reserve",
      );
    });

    it("deve lançar erro se stock estiver inativo", () => {
      const stock = Stock.create({ ...validProps, status: StockStatus.INACTIVE });
      expect(() => stock.reserve(Quantity.create(10))).toThrow(
        "Cannot reserve quantity from inactive stock",
      );
    });
  });

  describe("releaseReservation", () => {
    it("deve liberar reserva", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(100),
        reservedQuantity: Quantity.create(30),
      });
      stock.releaseReservation(Quantity.create(10));
      expect(stock.reservedQuantity.value).toBe(20);
    });

    it("deve lançar erro se tentar liberar mais que reservado", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(100),
        reservedQuantity: Quantity.create(10),
      });
      expect(() => stock.releaseReservation(Quantity.create(20))).toThrow(
        "Cannot realease more than reserved quantity",
      );
    });
  });

  describe("confirmReservation", () => {
    it("deve confirmar reserva e remover do stock", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(100),
        reservedQuantity: Quantity.create(30),
      });
      stock.confirmReservation(Quantity.create(20));
      expect(stock.reservedQuantity.value).toBe(10);
      expect(stock.quantity.value).toBe(80);
    });

    it("deve lançar erro se tentar confirmar mais que reservado", () => {
      const stock = Stock.create({
        ...validProps,
        quantity: Quantity.create(100),
        reservedQuantity: Quantity.create(10),
      });
      expect(() => stock.confirmReservation(Quantity.create(20))).toThrow(
        "Cannot confirm more than reserved quantity",
      );
    });
  });

  describe("status management", () => {
    it("deve ativar stock", () => {
      const stock = Stock.create({ ...validProps, status: StockStatus.INACTIVE });
      stock.activate();
      expect(stock.status).toBe(StockStatus.ACTIVE);
      expect(stock.isActive()).toBe(true);
    });

    it("deve desativar stock", () => {
      const stock = Stock.create(validProps);
      stock.deactivate();
      expect(stock.status).toBe(StockStatus.INACTIVE);
    });

    it("deve bloquear stock", () => {
      const stock = Stock.create(validProps);
      stock.block();
      expect(stock.status).toBe(StockStatus.BLOCKED);
      expect(stock.isBlocked()).toBe(true);
    });
  });
});
