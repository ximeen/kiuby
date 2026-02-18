import { describe, expect, it } from "vitest";
import { Money } from "../product/value_objects/money";
import { Quantity } from "../stock/value_objects/quantity";
import { SaleItem } from "./sale_item_entity";
import { Discount, DiscountType } from "./value_objects/discount";

describe("SaleItem", () => {
  const createItemProps = () => ({
    productId: "product-1",
    productName: "Produto Teste",
    quantity: Quantity.create(2),
    unitPrice: Money.create(50),
    discount: Discount.none(),
  });

  describe("create", () => {
    it("deve criar item de venda válido", () => {
      const item = SaleItem.create(createItemProps());
      expect(item.productId).toBe("product-1");
      expect(item.productName).toBe("Produto Teste");
      expect(item.quantity.value).toBe(2);
      expect(item.unitPrice.amount).toBe(50);
    });

    it("deve criar item com desconto", () => {
      const item = SaleItem.create({
        ...createItemProps(),
        discount: Discount.createPercentage(10),
      });
      expect(item.discount.type).toBe(DiscountType.PERCENTAGE);
    });

    it("deve lançar erro para quantidade zero", () => {
      expect(() => SaleItem.create({ ...createItemProps(), quantity: Quantity.zero() })).toThrow(
        "Item quantity must be greater than zero",
      );
    });

    it("deve lançar erro para preço zero", () => {
      expect(() => SaleItem.create({ ...createItemProps(), unitPrice: Money.create(0) })).toThrow(
        "Item unit price must be greater than zero",
      );
    });

    it("deve lançar erro para preço negativo", () => {
      expect(() => SaleItem.create({ ...createItemProps(), unitPrice: Money.create(-10) })).toThrow(
        "Amount cannot be negative",
      );
    });
  });

  describe("getSubtotal", () => {
    it("deve calcular subtotal corretamente", () => {
      const item = SaleItem.create(createItemProps());
      expect(item.getSubtotal().amount).toBe(100);
    });
  });

  describe("getDiscountAmount", () => {
    it("deve calcular desconto percentual", () => {
      const item = SaleItem.create({
        ...createItemProps(),
        discount: Discount.createPercentage(10),
      });
      expect(item.getDiscountAmount()).toBe(10);
    });

    it("deve calcular desconto fixo", () => {
      const item = SaleItem.create({
        ...createItemProps(),
        discount: Discount.createFixed(20),
      });
      expect(item.getDiscountAmount()).toBe(20);
    });
  });

  describe("getTotal", () => {
    it("deve calcular total com desconto percentual", () => {
      const item = SaleItem.create({
        ...createItemProps(),
        discount: Discount.createPercentage(10),
      });
      expect(item.getTotal().amount).toBe(90);
    });

    it("deve calcular total com desconto fixo", () => {
      const item = SaleItem.create({
        ...createItemProps(),
        discount: Discount.createFixed(30),
      });
      expect(item.getTotal().amount).toBe(70);
    });

    it("deve limitar desconto fixo ao valor do subtotal", () => {
      const item = SaleItem.create({
        ...createItemProps(),
        discount: Discount.createFixed(150),
      });
      expect(item.getTotal().amount).toBe(0);
    });
  });

  describe("updateQuantity", () => {
    it("deve atualizar quantidade", () => {
      const item = SaleItem.create(createItemProps());
      item.updateQuantity(Quantity.create(5));
      expect(item.quantity.value).toBe(5);
    });

    it("deve lançar erro para quantidade zero", () => {
      const item = SaleItem.create(createItemProps());
      expect(() => item.updateQuantity(Quantity.zero())).toThrow(
        "Item quantity must be greater than zero",
      );
    });
  });

  describe("applyDiscount", () => {
    it("deve aplicar desconto", () => {
      const item = SaleItem.create(createItemProps());
      item.applyDiscount(Discount.createPercentage(20));
      expect(item.discount.value).toBe(20);
    });
  });
});
