import { Money } from "@domain/entities/product/value_objects/money";
import { describe, expect, it } from "vitest";
import { CofinsCst, IcmsCst, IcmsOrigin, IpiCst, PisCst, TaxImpost, TaxType } from "./tax_impost";

describe("TaxImpost", () => {
  const baseMoney = Money.create(100);

  describe("createIcms", () => {
    it("deve criar imposto ICMS", () => {
      const tax = TaxImpost.createIcms(
        baseMoney,
        18,
        IcmsCst.TRIBUTED_INTEGRALLY,
        IcmsOrigin.NATIONAL,
      );
      expect(tax.type).toBe(TaxType.ICMS);
      expect(tax.rate).toBe(18);
      expect(tax.value.amount).toBe(18);
      expect(tax.isIcms()).toBe(true);
    });
  });

  describe("createPis", () => {
    it("deve criar imposto PIS", () => {
      const tax = TaxImpost.createPis(baseMoney, 1.65, PisCst.BASE_NORMAL);
      expect(tax.type).toBe(TaxType.PIS);
      expect(tax.rate).toBe(1.65);
      expect(tax.value.amount).toBeCloseTo(1.65);
      expect(tax.isPis()).toBe(true);
    });
  });

  describe("createCofins", () => {
    it("deve criar imposto COFINS", () => {
      const tax = TaxImpost.createCofins(baseMoney, 3, CofinsCst.BASE_NORMAL);
      expect(tax.type).toBe(TaxType.COFINS);
      expect(tax.rate).toBe(3);
      expect(tax.value.amount).toBe(3);
      expect(tax.isCofins()).toBe(true);
    });
  });

  describe("createIpi", () => {
    it("deve criar imposto IPI", () => {
      const tax = TaxImpost.createIpi(baseMoney, 5, IpiCst.TAXABLE);
      expect(tax.type).toBe(TaxType.IPI);
      expect(tax.rate).toBe(5);
      expect(tax.value.amount).toBe(5);
      expect(tax.isIpi()).toBe(true);
    });
  });

  describe("createEmpty", () => {
    it("deve criar imposto vazio", () => {
      const tax = TaxImpost.createEmpty(TaxType.ICMS);
      expect(tax.type).toBe(TaxType.ICMS);
      expect(tax.rate).toBe(0);
      expect(tax.value.amount).toBe(0);
    });
  });

  describe("recalculate", () => {
    it("deve recalcular imposto com nova base e taxa", () => {
      const tax = TaxImpost.createIcms(
        baseMoney,
        18,
        IcmsCst.TRIBUTED_INTEGRALLY,
        IcmsOrigin.NATIONAL,
      );
      const newBase = Money.create(200);
      const recalculated = tax.recalculate(newBase, 25);

      expect(recalculated.rate).toBe(25);
      expect(recalculated.base.amount).toBe(200);
      expect(recalculated.value.amount).toBe(50);
    });
  });
});
