import { describe, expect, it } from "vitest";
import { MovementReason, MovementType, StockMovement } from "./stock_movement.entity";
import { Quantity } from "./value_objects/quantity";

describe("StockMovement", () => {
  const createMovementProps = () => ({
    productId: "product-1",
    stockId: "stock-1",
    type: MovementType.ENTRY,
    reason: MovementReason.PURCHASE,
    quantity: Quantity.create(10),
    previousQuantity: Quantity.create(0),
    newQuantity: Quantity.create(10),
    userId: "user-1",
  });

  describe("create", () => {
    it("deve criar movimento de stock", () => {
      const movement = StockMovement.create(createMovementProps());
      expect(movement.productId).toBe("product-1");
      expect(movement.stockId).toBe("stock-1");
      expect(movement.type).toBe(MovementType.ENTRY);
      expect(movement.reason).toBe(MovementReason.PURCHASE);
    });

    it("deve criar movimento com campos opcionais", () => {
      const movement = StockMovement.create({
        ...createMovementProps(),
        notes: "Movimento de teste",
        referenceId: "ref-1",
        referenceType: "sale",
      });
      expect(movement.notes).toBe("Movimento de teste");
      expect(movement.referenceId).toBe("ref-1");
      expect(movement.referenceType).toBe("sale");
    });
  });

  describe("type checks", () => {
    it("deve verificar se é entrada", () => {
      const movement = StockMovement.create({
        ...createMovementProps(),
        type: MovementType.ENTRY,
      });
      expect(movement.isEntry()).toBe(true);
      expect(movement.isExit()).toBe(false);
    });

    it("deve verificar se é saída", () => {
      const movement = StockMovement.create({
        ...createMovementProps(),
        type: MovementType.EXIT,
      });
      expect(movement.isExit()).toBe(true);
      expect(movement.isEntry()).toBe(false);
    });

    it("deve verificar transferência como entrada", () => {
      const movement = StockMovement.create({
        ...createMovementProps(),
        type: MovementType.TRANSFER,
      });
      expect(movement.isEntry()).toBe(false);
      expect(movement.isExit()).toBe(false);
    });
  });

  describe("movement types", () => {
    it("deve criar movimento de entrada por compra", () => {
      const movement = StockMovement.create({
        ...createMovementProps(),
        type: MovementType.ENTRY,
        reason: MovementReason.PURCHASE,
      });
      expect(movement.type).toBe(MovementType.ENTRY);
      expect(movement.reason).toBe(MovementReason.PURCHASE);
    });

    it("deve criar movimento de saída por venda", () => {
      const movement = StockMovement.create({
        ...createMovementProps(),
        type: MovementType.EXIT,
        reason: MovementReason.SALE,
      });
      expect(movement.type).toBe(MovementType.EXIT);
      expect(movement.reason).toBe(MovementReason.SALE);
    });

    it("deve criar movimento de ajuste", () => {
      const movement = StockMovement.create({
        ...createMovementProps(),
        type: MovementType.ADJUSTMENT,
        reason: MovementReason.MANUAL_ADJUSTMENT,
      });
      expect(movement.type).toBe(MovementType.ADJUSTMENT);
    });

    it("deve criar movimento de transferência", () => {
      const movement = StockMovement.create({
        ...createMovementProps(),
        type: MovementType.TRANSFER,
        reason: MovementReason.TRANSFER_IN,
      });
      expect(movement.type).toBe(MovementType.TRANSFER);
    });

    it("deve criar movimento de devolução", () => {
      const movement = StockMovement.create({
        ...createMovementProps(),
        type: MovementType.RETURN,
        reason: MovementReason.CUSTOMER_RETURN,
      });
      expect(movement.type).toBe(MovementType.RETURN);
    });

    it("deve criar movimento de perda", () => {
      const movement = StockMovement.create({
        ...createMovementProps(),
        type: MovementType.LOSS,
        reason: MovementReason.DAMAGED,
      });
      expect(movement.type).toBe(MovementType.LOSS);
    });
  });

  describe("getters", () => {
    it("deve retornar todos os getters", () => {
      const props = createMovementProps();
      const movement = StockMovement.create(props);

      expect(movement.quantity).toBe(props.quantity);
      expect(movement.previousQuantity).toBe(props.previousQuantity);
      expect(movement.newQuantity).toBe(props.newQuantity);
      expect(movement.userId).toBe(props.userId);
    });
  });
});
