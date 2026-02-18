import { beforeEach, describe, expect, it } from "vitest";
import { Product, ProductStatus } from "./product_entity";
import type { Money } from "./value_objects/money";
import type { ProductName } from "./value_objects/product_name";
import type { SKU } from "./value_objects/sku";

const createMockProductName = (value: string): ProductName => ({ value }) as ProductName;
const creatMockSKU = (value: string): SKU => ({ value }) as SKU;
const createMockMoney = (amount: number, currency = "BRL"): Money =>
  ({
    amount,
    currency,
    subtract: function (other: Money) {
      return createMockMoney(this.amount - other.amount, this.currency);
    },
  }) as Money;

describe("Product", () => {
  let validProps: Parameters<typeof Product.create>[0];

  beforeEach(() => {
    validProps = {
      name: createMockProductName("Product test"),
      sku: creatMockSKU("PROD-01"),
      price: createMockMoney(120),
      minStockLevel: 10,
      unit: "un",
    };
  });

  describe("Create", () => {
    it("Deve criar um produto com status ACTIVE por padrão", () => {
      const product = Product.create(validProps);

      expect(product.status).toBe(ProductStatus.ACTIVE);
      expect(product.name).toBe(validProps.name);
      expect(product.sku).toBe(validProps.sku);
      expect(product.price).toBe(validProps.price);
    });

    it("Deve criar um produto com status específico", () => {
      const product = Product.create({
        ...validProps,
        status: ProductStatus.INACTIVE,
      });

      expect(product.status).toBe(ProductStatus.INACTIVE);
    });

    it("Deve criar um produto com campos opcionais", () => {
      const product = Product.create({
        ...validProps,
        description: "Descrição teste",
        costPrice: createMockMoney(50),
        categoryId: "CAT-01",
        maxStockLevel: 300,
      });

      expect(product.description).toBe("Descrição teste");
      expect(product.costPrice?.amount).toBe(50);
      expect(product.categoryId).toBe("CAT-01");
      expect(product.maxStockLevel).toBe(300);
    });
  });

  describe("Update price", () => {
    it("Deve atualizar o preço corretamente", () => {
      const product = Product.create(validProps);
      const newPrice = createMockMoney(230);

      product.updatePrice(newPrice);
      expect(product.price).toBe(newPrice);
    });

    it("Deve lançar um erro ao tentar definir preço zero ou negativo", () => {
      const product = Product.create(validProps);
      expect(() => product.updatePrice(createMockMoney(0))).toThrow(
        "Price must be greater than zero",
      );
      expect(() => product.updatePrice(createMockMoney(-10))).toThrow(
        "Price must be greater than zero",
      );
    });
  });

  describe("Update Cost Price", () => {
    it("Deve atualizar o preço de custo", () => {
      const product = Product.create(validProps);
      const newCostPrice = createMockMoney(20);

      product.updateCostPrice(newCostPrice);
      expect(product.costPrice).toBe(newCostPrice);
    });
  });

  describe("Calculate Profit Margin", () => {
    it("Deve calcular margem de lucro corretamente", () => {
      const product = Product.create({
        ...validProps,
        price: createMockMoney(100),
        costPrice: createMockMoney(50),
      });

      const margin = product.calculateProfitMargin();
      expect(margin).toBe(100);
    });

    it("Deve lançar erro se não houver preço de custo", () => {
      const product = Product.create(validProps);
      expect(() => product.calculateProfitMargin()).toThrow(
        "Cannot calculate profit margin without cost price",
      );
    });
  });

  describe("Status Management", () => {
    it("Deve ativar um produto inativo", () => {
      const product = Product.create({
        ...validProps,
        status: ProductStatus.INACTIVE,
      });

      product.activate();

      expect(product.status).toBe(ProductStatus.ACTIVE);
      expect(product.isActive()).toBe(true);
    });

    it("Deve lançar um erro ao tentar ativar um produto descontinuado", () => {
      const product = Product.create({
        ...validProps,
        status: ProductStatus.DISCONTINUED,
      });

      expect(() => product.activate()).toThrow("Cannot activate a discontinued product");
    });

    it("Deve desativar um produto", () => {
      const product = Product.create(validProps);
      product.deactivate();

      expect(product.status).toBe(ProductStatus.INACTIVE);
      expect(product.isActive()).toBe(false);
    });

    it("Deve descontinuar um produto", () => {
      const product = Product.create(validProps);

      product.discontinue();

      expect(product.status).toBe(ProductStatus.DISCONTINUED);
      expect(product.isActive()).toBe(false);
    });
  });

  describe("Update Description", () => {
    it("Deve atualizar a descrição removendo espaços extras", () => {
      const product = Product.create(validProps);

      product.updateDescription("   Nova Descrição");

      expect(product.description).toBe("Nova Descrição");
    });
  });

  describe("Update Stock Level", () => {
    it("Deve atualizar níveis de estoque corretamente", () => {
      const product = Product.create(validProps);

      product.updateStockLevels(5, 50);

      expect(product.minStockLevel).toBe(5);
      expect(product.maxStockLevel).toBe(50);
    });

    it("Deve lançar erro se o nível for negativo", () => {
      const product = Product.create(validProps);

      expect(() => product.updateStockLevels(-1)).toThrow("Minimum stock level cannot be negative");
    });

    it("Deve lançar erro se o mínimo for maior de que o maximo", () => {
      const product = Product.create(validProps);

      expect(() => product.updateStockLevels(50, 10)).toThrow(
        "Maximum stock level cannot be less than minimum",
      );
    });

    it("Deve permitir atualizar apenas o minimo", () => {
      const product = Product.create(validProps);

      product.updateStockLevels(15);

      expect(product.minStockLevel).toBe(15);
      expect(product.maxStockLevel).toBeUndefined();
    });
  });
});
