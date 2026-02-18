import { describe, expect, it } from "vitest";
import { Money } from "../product/value_objects/money";
import { Quantity } from "../stock/value_objects/quantity";
import { PaymentMethod, Sale, SaleStatus } from "./sale_entity";
import { SaleItem } from "./sale_item_entity";
import { Discount, DiscountType } from "./value_objects/discount";

describe("Sale", () => {
  const createItem = () =>
    SaleItem.create({
      productId: "product-1",
      productName: "Produto Teste",
      quantity: Quantity.create(2),
      unitPrice: Money.create(50),
      discount: Discount.none(),
    });

  const createSaleProps = () => ({
    customerId: "customer-1",
    customerName: "Cliente Teste",
    createdBy: "user-1",
  });

  describe("create", () => {
    it("deve criar venda com status DRAFT", () => {
      const sale = Sale.create(createSaleProps());
      expect(sale.status).toBe(SaleStatus.DRAFT);
      expect(sale.isDraft()).toBe(true);
    });

    it("deve criar venda com itens", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        items: [createItem()],
      });
      expect(sale.items).toHaveLength(1);
    });

    it("deve criar venda com desconto", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        discount: Discount.createPercentage(10),
      });
      expect(sale.discount.type).toBe(DiscountType.PERCENTAGE);
    });
  });

  describe("getSubtotal", () => {
    it("deve calcular subtotal corretamente", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        items: [createItem()],
      });
      expect(sale.getSubtotal().amount).toBe(100);
    });

    it("deve retornar zero para venda sem itens", () => {
      const sale = Sale.create(createSaleProps());
      expect(sale.getSubtotal().amount).toBe(0);
    });
  });

  describe("getTotalBeforeDiscount", () => {
    it("deve calcular total antes do desconto", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        items: [createItem()],
      });
      expect(sale.getTotalBeforeDiscount().amount).toBe(100);
    });
  });

  describe("getSaleDiscountAmount", () => {
    it("deve calcular desconto da venda", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        items: [createItem()],
        discount: Discount.createPercentage(10),
      });
      expect(sale.getSaleDiscountAmount()).toBe(10);
    });
  });

  describe("getTotal", () => {
    it("deve calcular total com desconto", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        items: [createItem()],
        discount: Discount.createPercentage(10),
      });
      expect(sale.getTotal().amount).toBe(90);
    });
  });

  describe("addItem", () => {
    it("deve adicionar item à venda", () => {
      const sale = Sale.create(createSaleProps());
      sale.addItem(createItem());
      expect(sale.items).toHaveLength(1);
    });

    it("deve lançar erro se status não permitir modificação", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        status: SaleStatus.COMPLETED,
      });
      expect(() => sale.addItem(createItem())).toThrow("Cannot modify items in current status");
    });
  });

  describe("removeItem", () => {
    it("deve remover item da venda", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        items: [createItem()],
      });
      sale.removeItem("product-1");
      expect(sale.items).toHaveLength(0);
    });

    it("deve lançar erro se item não existir", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        items: [createItem()],
      });
      expect(() => sale.removeItem("product-inexistente")).toThrow("Item not found");
    });
  });

  describe("submitForApproval", () => {
    it("deve submeter venda para aprovação", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        items: [createItem()],
      });
      sale.submitForApproval();
      expect(sale.status).toBe(SaleStatus.PENDING);
      expect(sale.isPending()).toBe(true);
    });

    it("deve lançar erro se venda não estiver em draft", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        status: SaleStatus.COMPLETED,
      });
      expect(() => sale.submitForApproval()).toThrow("Only draft sales can be submmited");
    });

    it("deve lançar erro se venda não tiver itens", () => {
      const sale = Sale.create(createSaleProps());
      expect(() => sale.submitForApproval()).toThrow("Cannot submmit sale without items");
    });
  });

  describe("approve", () => {
    it("deve aprovar venda", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        status: SaleStatus.PENDING,
      });
      sale.approve("manager-1");
      expect(sale.status).toBe(SaleStatus.APPROVED);
      expect(sale.approvedBy).toBe("manager-1");
      expect(sale.approvedAt).toBeInstanceOf(Date);
    });

    it("deve lançar erro se venda não estiver pendente", () => {
      const sale = Sale.create(createSaleProps());
      expect(() => sale.approve("manager-1")).toThrow("Only pending sales can be approved.");
    });
  });

  describe("reject", () => {
    it("deve rejeitar venda", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        status: SaleStatus.PENDING,
      });
      sale.reject("manager-1", "Motivo da rejeição");
      expect(sale.status).toBe(SaleStatus.REJECTED);
      expect(sale.rejectionReason).toBe("Motivo da rejeição");
    });

    it("deve lançar erro se venda não estiver pendente", () => {
      const sale = Sale.create(createSaleProps());
      expect(() => sale.reject("manager-1", "motivo")).toThrow(
        "Only pending sales can be rejected",
      );
    });
  });

  describe("startProcessing", () => {
    it("deve iniciar processamento da venda", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        status: SaleStatus.APPROVED,
      });
      sale.startProcessing();
      expect(sale.status).toBe(SaleStatus.PROCESSING);
    });

    it("deve lançar erro se venda não estiver aprovada", () => {
      const sale = Sale.create(createSaleProps());
      expect(() => sale.startProcessing()).toThrow("Only approved sales can be processed");
    });
  });

  describe("complete", () => {
    it("deve completar venda", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        status: SaleStatus.PROCESSING,
      });
      sale.complete();
      expect(sale.status).toBe(SaleStatus.COMPLETED);
      expect(sale.isCompleted()).toBe(true);
    });

    it("deve lançar erro se venda não estiver em processamento", () => {
      const sale = Sale.create(createSaleProps());
      expect(() => sale.complete()).toThrow("Only processing sales can be completed ");
    });
  });

  describe("cancel", () => {
    it("deve cancelar venda em draft", () => {
      const sale = Sale.create(createSaleProps());
      sale.cancel();
      expect(sale.status).toBe(SaleStatus.CANCELLED);
    });

    it("deve cancelar venda pendente", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        status: SaleStatus.PENDING,
      });
      sale.cancel();
      expect(sale.status).toBe(SaleStatus.CANCELLED);
    });

    it("não deve cancelar venda já completada", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        status: SaleStatus.COMPLETED,
      });
      expect(() => sale.cancel()).toThrow("Cannot cancel sale in current status");
    });
  });

  describe("setPaymentMethod", () => {
    it("deve definir método de pagamento", () => {
      const sale = Sale.create(createSaleProps());
      sale.setPaymentMethod(PaymentMethod.PIX);
      expect(sale.paymentMethod).toBe(PaymentMethod.PIX);
    });
  });

  describe("applySaleDiscount", () => {
    it("deve aplicar desconto à venda", () => {
      const sale = Sale.create({
        ...createSaleProps(),
        items: [createItem()],
      });
      sale.applySaleDiscount(Discount.createPercentage(20));
      expect(sale.discount.value).toBe(20);
    });
  });
});
