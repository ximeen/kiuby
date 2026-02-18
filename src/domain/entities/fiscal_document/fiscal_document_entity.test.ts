import { describe, expect, it } from "vitest";
import { Money } from "../product/value_objects/money";
import { PaymentMethod } from "../sale/sale_entity";
import { Discount } from "../sale/value_objects/discount";
import { Quantity } from "../stock/value_objects/quantity";
import { FiscalDocument } from "./fiscal_document_entity";
import { FiscalDocumentItem } from "./fiscal_document_item_entity";
import {
  FiscalDocumentStatus,
  FiscalDocumentStatusVO,
} from "./value_objects/fiscal_document_status";
import { FiscalDocumentTypeVO } from "./value_objects/fiscal_document_type";

describe("FiscalDocument", () => {
  const createDocProps = () => ({
    type: FiscalDocumentTypeVO.createOutputNfe(),
    series: 1,
    number: 1000,
    warehouseId: "warehouse-1",
  });

  const createItem = () =>
    FiscalDocumentItem.create({
      productId: "product-1",
      productName: "Produto Teste",
      quantity: Quantity.create(2),
      unitPrice: Money.create(50),
    });

  describe("create", () => {
    it("deve criar documento fiscal com status DRAFT", () => {
      const doc = FiscalDocument.create(createDocProps());
      expect(doc.status.status).toBe(FiscalDocumentStatus.DRAFT);
      expect(doc.isDraft()).toBe(true);
    });

    it("deve criar documento com itens", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        items: [createItem()],
      });
      expect(doc.items).toHaveLength(1);
    });

    it("deve lançar erro para série zero", () => {
      expect(() => FiscalDocument.create({ ...createDocProps(), series: 0 })).toThrow(
        "Series must be greater than zero",
      );
    });

    it("deve lançar erro para número zero", () => {
      expect(() => FiscalDocument.create({ ...createDocProps(), number: 0 })).toThrow(
        "Number must be greater than zero",
      );
    });
  });

  describe("getDocumentNumber", () => {
    it("deve retornar número do documento formatado", () => {
      const doc = FiscalDocument.create(createDocProps());
      expect(doc.getDocumentNumber()).toBe("1-000001000");
    });
  });

  describe("getSubtotal", () => {
    it("deve calcular subtotal dos itens", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        items: [createItem()],
      });
      expect(doc.getSubtotal().amount).toBe(100);
    });
  });

  describe("getItemsDiscount", () => {
    it("deve calcular desconto dos itens", () => {
      const item = FiscalDocumentItem.create({
        productId: "product-1",
        productName: "Produto",
        quantity: Quantity.create(1),
        unitPrice: Money.create(100),
        discount: Discount.createPercentage(10),
      });
      const doc = FiscalDocument.create({
        ...createDocProps(),
        items: [item],
      });
      expect(doc.getItemsDiscount()).toBe(10);
    });
  });

  describe("calculateTotals", () => {
    it("deve calcular totais", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        items: [createItem()],
      });
      doc.calculateTotals();
      expect(doc.subtotal.amount).toBe(100);
    });
  });

  describe("addItem", () => {
    it("deve adicionar item ao documento", () => {
      const doc = FiscalDocument.create(createDocProps());
      doc.addItem(createItem());
      expect(doc.items).toHaveLength(1);
    });

    it("deve lançar erro se documento não estiver em draft", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        status: FiscalDocumentStatusVO.createIssued(),
      });
      expect(() => doc.addItem(createItem())).toThrow("Cannot modify items in current status");
    });
  });

  describe("removeItem", () => {
    it("deve remover item do documento", () => {
      const item = createItem();
      const doc = FiscalDocument.create({
        ...createDocProps(),
        items: [item],
      });
      doc.removeItem(item.id);
      expect(doc.items).toHaveLength(0);
    });
  });

  describe("canIssue", () => {
    it("deve poder emitir documento com itens", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        items: [createItem()],
      });
      expect(doc.canIssue()).toBe(true);
    });

    it("não deve poder emitir documento sem itens", () => {
      const doc = FiscalDocument.create(createDocProps());
      expect(doc.canIssue()).toBe(false);
    });

    it("não deve poder emitir documento já emitido", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        status: FiscalDocumentStatusVO.createIssued(),
        items: [createItem()],
      });
      expect(doc.canIssue()).toBe(false);
    });
  });

  describe("issue", () => {
    it("deve emitir documento fiscal", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        items: [createItem()],
      });
      doc.issue("12345678901234567890123456789012345678901234");
      expect(doc.status.status).toBe(FiscalDocumentStatus.ISSUED);
      expect(doc.accessKey).toBe("12345678901234567890123456789012345678901234");
      expect(doc.isIssued()).toBe(true);
    });

    it("deve lançar erro para chave de acesso inválida", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        items: [createItem()],
      });
      expect(() => doc.issue("123")).toThrow("Invalid access key");
    });
  });

  describe("cancel", () => {
    it("deve cancelar documento emitido", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        status: FiscalDocumentStatusVO.createIssued(),
        items: [createItem()],
      });
      doc.cancel("Motivo do cancelamento");
      expect(doc.status.status).toBe(FiscalDocumentStatus.CANCELLED);
      expect(doc.cancellationReason).toBe("Motivo do cancelamento");
    });

    it("deve lançar erro para documento em draft", () => {
      const doc = FiscalDocument.create(createDocProps());
      expect(() => doc.cancel("motivo")).toThrow("Cannot cancel fiscal document in current status");
    });

    it("deve lançar erro sem motivo", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        status: FiscalDocumentStatusVO.createIssued(),
      });
      expect(() => doc.cancel("")).toThrow("Cancellation reason is required");
    });
  });

  describe("setEntryDate", () => {
    it("deve definir data de entrada para documento de entrada", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        type: FiscalDocumentTypeVO.createInputNfe(),
      });
      doc.setEntryDate(new Date());
      expect(doc.entryDate).toBeInstanceOf(Date);
    });

    it("deve lançar erro para documento de saída", () => {
      const doc = FiscalDocument.create(createDocProps());
      expect(() => doc.setEntryDate(new Date())).toThrow("Entry date is only for input documents");
    });
  });

  describe("setPaymentMethod", () => {
    it("deve definir método de pagamento", () => {
      const doc = FiscalDocument.create(createDocProps());
      doc.setPaymentMethod(PaymentMethod.PIX);
      expect(doc.paymentMethod).toBe(PaymentMethod.PIX);
    });
  });

  describe("isLinkedToSale", () => {
    it("deve retornar true se vinculado a venda", () => {
      const doc = FiscalDocument.create({
        ...createDocProps(),
        saleId: "sale-1",
      });
      expect(doc.isLinkedToSale()).toBe(true);
    });

    it("deve retornar false se não vinculado a venda", () => {
      const doc = FiscalDocument.create(createDocProps());
      expect(doc.isLinkedToSale()).toBe(false);
    });
  });
});
