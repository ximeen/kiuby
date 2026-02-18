import { describe, expect, it } from "vitest";
import { Money } from "../product/value_objects/money";
import { Discount } from "../sale/value_objects/discount";
import { Quantity } from "../stock/value_objects/quantity";
import { FiscalDocumentItem } from "./fiscal_document_item_entity";
import { IcmsCst, IcmsOrigin, TaxImpost, TaxType } from "./value_objects/tax_impost";

describe("FiscalDocumentItem", () => {
  const createItemProps = () => ({
    productId: "product-1",
    productName: "Produto Teste",
    quantity: Quantity.create(2),
    unitPrice: Money.create(50),
  });

  describe("create", () => {
    it("deve criar item de documento fiscal válido", () => {
      const item = FiscalDocumentItem.create(createItemProps());
      expect(item.productId).toBe("product-1");
      expect(item.productName).toBe("Produto Teste");
      expect(item.quantity.value).toBe(2);
      expect(item.unitPrice.amount).toBe(50);
    });

    it("deve criar item com impostos vazios por padrão", () => {
      const item = FiscalDocumentItem.create(createItemProps());
      expect(item.icms.type).toBe(TaxType.ICMS);
      expect(item.pis.type).toBe(TaxType.PIS);
    });

    it("deve criar item com desconto", () => {
      const item = FiscalDocumentItem.create({
        ...createItemProps(),
        discount: Discount.createPercentage(10),
      });
      expect(item.discount.value).toBe(10);
    });

    it("deve lançar erro para quantidade zero", () => {
      expect(() =>
        FiscalDocumentItem.create({ ...createItemProps(), quantity: Quantity.zero() }),
      ).toThrow("Item quantity must be greater than zero");
    });

    it("deve lançar erro para preço zero", () => {
      expect(() =>
        FiscalDocumentItem.create({ ...createItemProps(), unitPrice: Money.create(0) }),
      ).toThrow("Item unit price must be greater than zero");
    });
  });

  describe("getSubtotal", () => {
    it("deve calcular subtotal corretamente", () => {
      const item = FiscalDocumentItem.create(createItemProps());
      expect(item.getSubtotal().amount).toBe(100);
    });
  });

  describe("getDiscountAmount", () => {
    it("deve calcular desconto", () => {
      const item = FiscalDocumentItem.create({
        ...createItemProps(),
        discount: Discount.createPercentage(10),
      });
      expect(item.getDiscountAmount()).toBe(10);
    });
  });

  describe("getTotalTax", () => {
    it("deve calcular total de impostos", () => {
      const baseMoney = Money.create(100);
      const item = FiscalDocumentItem.create({
        ...createItemProps(),
        icms: TaxImpost.createIcms(baseMoney, 18, IcmsCst.TRIBUTED_INTEGRALLY, IcmsOrigin.NATIONAL),
      });
      const totalTax = item.getTotalTax();
      expect(totalTax.amount).toBe(18);
    });
  });

  describe("getTotal", () => {
    it("deve calcular total com impostos e desconto", () => {
      const baseMoney = Money.create(100);
      const item = FiscalDocumentItem.create({
        ...createItemProps(),
        discount: Discount.createPercentage(10),
        icms: TaxImpost.createIcms(baseMoney, 18, IcmsCst.TRIBUTED_INTEGRALLY, IcmsOrigin.NATIONAL),
      });
      const total = item.getTotal();
      expect(total.amount).toBeGreaterThan(0);
    });
  });

  describe("updateQuantity", () => {
    it("deve atualizar quantidade", () => {
      const item = FiscalDocumentItem.create(createItemProps());
      item.updateQuantity(Quantity.create(5));
      expect(item.quantity.value).toBe(5);
    });

    it("deve lançar erro para quantidade zero", () => {
      const item = FiscalDocumentItem.create(createItemProps());
      expect(() => item.updateQuantity(Quantity.zero())).toThrow(
        "Item quantity must be greater than zero",
      );
    });
  });

  describe("updatePrice", () => {
    it("deve atualizar preço", () => {
      const item = FiscalDocumentItem.create(createItemProps());
      item.updatePrice(Money.create(75));
      expect(item.unitPrice.amount).toBe(75);
    });

    it("deve lançar erro para preço negativo", () => {
      const item = FiscalDocumentItem.create(createItemProps());
      expect(() => item.updatePrice(Money.create(-10))).toThrow("Amount cannot be negative");
    });
  });

  describe("applyDiscount", () => {
    it("deve aplicar desconto", () => {
      const item = FiscalDocumentItem.create(createItemProps());
      item.applyDiscount(Discount.createPercentage(20));
      expect(item.discount.value).toBe(20);
    });
  });
});
