import { Entity } from "@domain/shared/entity";
import type { Quantity } from "./value_objects/quantity";

export enum MovementType {
  ENTRY = "entry",
  EXIT = "exit",
  ADJUSTMENT = "adjustment",
  TRANSFER = "transfer",
  RETURN = "return",
  LOSS = "loss",
}

export enum MovementReason {
  PURCHASE = "purchase",
  SALE = "sale",
  MANUAL_ADJUSTMENT = "manual",
  TRANSFER_OUT = "transfer_out",
  TRANSFER_IN = "transfer_in",
  CUSTOMER_RETURN = "return",
  DAMAGED = "damaged",
  EXPIRED = "expired",
  INVENTORY = "inventory",
}

interface StockMovementProps {
  productId: string;
  stockId: string;
  type: MovementType;
  reason: MovementReason;
  quantity: Quantity;
  previousQuantity: Quantity;
  newQuantity: Quantity;
  userId: string;
  notes?: string;
  referenceId?: string;
  referenceType?: string;
}

export class StockMovement extends Entity<StockMovementProps> {
  private constructor(props: StockMovementProps, id?: string) {
    super(props, id);
  }

  static create(props: StockMovementProps, id?: string): StockMovement {
    return new StockMovement(props, id);
  }

  get productId(): string {
    return this.props.productId;
  }

  get stockId(): string {
    return this.props.stockId;
  }

  get type(): MovementType {
    return this.props.type;
  }

  get reason(): MovementReason {
    return this.props.reason;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  get previousQuantity(): Quantity {
    return this.props.previousQuantity;
  }

  get newQuantity(): Quantity {
    return this.props.newQuantity;
  }

  get userId(): string {
    return this.props.userId;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get referenceId(): string | undefined {
    return this.props.referenceId;
  }

  get referenceType(): string | undefined {
    return this.props.referenceType;
  }

  isEntry(): boolean {
    return this.props.type === MovementType.ENTRY;
  }

  isExit(): boolean {
    return this.props.type === MovementType.EXIT;
  }
}
