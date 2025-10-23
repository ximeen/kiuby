import { Entity } from "@domain/shared/entity";
import { Quantity } from "./value_objects/quantity";

export enum StockStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

interface StockProps {
  productId: string;
  warehouseId: string;
  quantity: Quantity;
  reservedQuantity: Quantity;
  status: StockStatus;
  lastMovementAt: Date;
}

export class Stock extends Entity<StockProps> {
  private constructor(props: StockProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<StockProps, "status" | "reservedQuantity"> & {
      status?: StockStatus;
      reservedQuantity?: Quantity;
    },
    id?: string,
  ): Stock {
    return new Stock(
      {
        ...props,
        status: props.status ?? StockStatus.ACTIVE,
        reservedQuantity: props.reservedQuantity ?? Quantity.zero(),
      },
      id,
    );
  }

  get productId(): string {
    return this.props.productId;
  }

  get warehouseId(): string {
    return this.props.warehouseId;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  get reservedQuantity(): Quantity {
    return this.props.reservedQuantity;
  }

  get status(): StockStatus {
    return this.props.status;
  }

  get lastMovementAt(): Date | undefined {
    return this.props.lastMovementAt;
  }

  getAvailableQuantity(): Quantity {
    return this.props.quantity.subtract(this.props.reservedQuantity);
  }

  hasAvailableQuantity(required: Quantity): boolean {
    return this.getAvailableQuantity().isSufficientFor(required);
  }

  addQuantity(quantity: Quantity): void {
    if (!this.isActive()) {
      throw new Error("Cannot add quantity to inactive stock");
    }

    this.props.quantity = this.props.quantity.add(quantity);
    this.props.lastMovementAt = new Date();
    this.touch();
  }

  removeQuantity(quantity: Quantity): void {
    if (!this.isActive()) {
      throw new Error("Cannot remove quantity from inactive stock");
    }

    const available = this.getAvailableQuantity();
    if (!available.isSufficientFor(quantity)) {
      throw new Error(
        `Insufficient available stock. Available: ${available.value}, required: ${quantity.value}`,
      );
    }

    this.props.quantity = this.props.quantity.subtract(quantity);
    this.props.lastMovementAt = new Date();
    this.touch();
  }

  reserve(quantity: Quantity): void {
    if (!this.isActive()) {
      throw new Error("Cannot reserve quantity from inactive stock");
    }
    if (!this.hasAvailableQuantity(quantity)) {
      throw new Error("Insufficient available quantity to reserve");
    }
    this.props.reservedQuantity = this.props.reservedQuantity.add(quantity);
    this.touch();
  }
  releaseReservation(quantity: Quantity): void {
    if (this.props.reservedQuantity.isLessThan(quantity)) {
      throw new Error("Cannot realease more than reserved quantity");
    }
    this.props.reservedQuantity = this.props.reservedQuantity.subtract(quantity);
    this.touch();
  }

  confirmReservation(quantity: Quantity): void {
    if (this.props.reservedQuantity.isLessThan(quantity)) {
      throw new Error("Cannot confirm more than reserved quantity");
    }

    this.props.reservedQuantity = this.props.reservedQuantity.subtract(quantity);
    this.props.quantity = this.props.quantity.subtract(quantity);
    this.props.lastMovementAt = new Date();
    this.touch();
  }

  activate(): void {
    this.props.status = StockStatus.ACTIVE;
    this.touch();
  }

  deactivate(): void {
    this.props.status = StockStatus.INACTIVE;
    this.touch();
  }

  block(): void {
    this.props.status = StockStatus.BLOCKED;
    this.touch();
  }

  isActive(): boolean {
    return this.props.status === StockStatus.ACTIVE;
  }

  isBlocked(): boolean {
    return this.props.status === StockStatus.BLOCKED;
  }
}
