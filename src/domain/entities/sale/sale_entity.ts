import { Entity } from "@domain/shared/entity";
import { Money } from "../product/value_objects/money";
import type { Quantity } from "../stock/value_objects/quantity";
import type { SaleItem } from "./sale_item_entity";
import { Discount } from "./value_objects/discount";

export enum SaleStatus {
  DRAFT = "draft",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum PaymentMethod {
  CASH = "cash",
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  PIX = "pix",
  BANK_SLIP = "bank_slip",
  CREDIT = "credit",
}

interface SaleProps {
  customerId: string;
  customerName: string;
  items: SaleItem[];
  status: SaleStatus;
  discount: Discount;
  paymentMethod?: PaymentMethod;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  notes?: string;
}

export class Sale extends Entity<SaleProps> {
  private constructor(props: SaleProps, id?: string) {
    super(props, id);
  }
  static create(
    props: Omit<SaleProps, "status" | "discount" | "items"> & {
      status?: SaleStatus;
      discount?: Discount;
      items?: SaleItem[];
    },
    id?: string,
  ) {
    return new Sale({
      ...props,
      status: props.status ?? SaleStatus.DRAFT,
      discount: props.discount ?? Discount.none(),
      items: props.items ?? [],
    });
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get customerName(): string {
    return this.props.customerName;
  }

  get items(): SaleItem[] {
    return [...this.props.items];
  }

  get status(): SaleStatus {
    return this.props.status;
  }

  get discount(): Discount {
    return this.props.discount;
  }

  get paymentMethod(): PaymentMethod | undefined {
    return this.props.paymentMethod;
  }

  get createdBy(): string {
    return this.props.createdBy;
  }

  get approvedBy(): string | undefined {
    return this.props.approvedBy;
  }

  get approvedAt(): Date | undefined {
    return this.props.approvedAt;
  }

  get rejectedBy(): string | undefined {
    return this.props.rejectedBy;
  }

  get rejectedAt(): Date | undefined {
    return this.props.rejectedAt;
  }

  get rejectionReason(): string | undefined {
    return this.props.rejectionReason;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  getSubtotal(): Money {
    if (this.props.items.length === 0) {
      return Money.create(0);
    }
    return this.props.items.reduce((total, item) => {
      return total.add(item.getSubtotal());
    }, Money.create(0));
  }

  getItemsDiscount(): number {
    return this.props.items.reduce((total, item) => {
      return total + item.getDiscountAmount();
    }, 0);
  }

  getTotalBeforeDiscount(): Money {
    if (this.props.items.length === 0) {
      return Money.create(0);
    }
    return this.props.items.reduce((total, item) => {
      return total.add(item.getTotal());
    }, Money.create(0));
  }

  getSaleDiscountAmount(): number {
    const totalBefore = this.getTotalBeforeDiscount();
    return this.props.discount.calculateDiscount(totalBefore.amount);
  }

  getTotal(): Money {
    const totalBefore = this.getTotalBeforeDiscount();
    const finalAmount = this.props.discount.apply(totalBefore.amount);
    return Money.create(finalAmount, totalBefore.currency);
  }

  addItem(item: SaleItem): void {
    if (!this.canModifyItems()) {
      throw new Error("Cannot modify items in current status");
    }
    const existingItemIndex = this.props.items.findIndex((i) => i.productId === item.productId);

    if (existingItemIndex >= 0) {
      const existingItem = this.props.items[existingItemIndex];
      const newQuantity = existingItem.quantity.add(item.quantity);
      existingItem.updateQuantity(newQuantity);
    }
    this.props.items.push(item);
    this.touch();
  }

  removeItem(itemId: string): void {
    if (!this.canModifyItems()) {
      throw new Error("Cannot modify items in current status");
    }
    const index = this.props.items.findIndex((i) => i.productId === itemId);

    if (index === -1) {
      throw new Error("Item not found");
    }
    this.props.items.splice(index, 1);
  }

  updateItemQuantity(itemId: string, quantity: Quantity): void {
    if (!this.canModifyItems()) {
      throw new Error("Cannot modify items in current status");
    }
    const item = this.props.items.find((i) => i.id, itemId);
    if (!item) {
      throw new Error("Item not found");
    }
    item.updateQuantity(quantity);
    this.touch();
  }

  applySaleDiscount(discount: Discount): void {
    if (!this.canModifyItems()) {
      throw new Error("Cannot modify discount in current status");
    }

    this.props.discount = discount;
    this.touch();
  }

  canModifyItems(): boolean {
    return [SaleStatus.DRAFT, SaleStatus.REJECTED].includes(this.props.status);
  }

  submitForApproval(): void {
    if (this.props.status !== SaleStatus.DRAFT) {
      throw new Error("Only draft sales can be submmited");
    }
    if (this.props.items.length === 0) {
      throw new Error("Cannot submmit sale without items");
    }

    this.props.status = SaleStatus.PENDING;
    this.touch();
  }

  approve(userId: string): void {
    if (this.props.status !== SaleStatus.PENDING) {
      throw new Error("Only pending sales can be approved.");
    }
    this.props.status = SaleStatus.APPROVED;
    this.props.approvedBy = userId;
    this.props.approvedAt = new Date();
    this.touch();
  }
  reject(userId: string, reason: string): void {
    if (this.props.status !== SaleStatus.PENDING) {
      throw new Error("Only pending sales can be rejected");
    }
    this.props.status = SaleStatus.REJECTED;
    this.props.rejectedBy = userId;
    this.props.rejectedAt = new Date();
    this.props.rejectionReason = reason;
    this.touch();
  }

  startProcessing(): void {
    if (this.props.status !== SaleStatus.APPROVED) {
      throw new Error("Only approved sales can be processed");
    }

    this.props.status = SaleStatus.PROCESSING;
    this.touch();
  }

  complete(): void {
    if (this.props.status !== SaleStatus.PROCESSING) {
      throw new Error("Only processing sales can be completed ");
    }
    this.props.status = SaleStatus.COMPLETED;
    this.touch();
  }

  cancel(): void {
    if (![SaleStatus.DRAFT, SaleStatus.PENDING, SaleStatus.REJECTED].includes(this.props.status)) {
      throw new Error("Cannot cancel sale in current status");
    }

    this.props.status = SaleStatus.CANCELLED;
    this.touch();
  }

  setPaymentMethod(method: PaymentMethod): void {
    this.props.paymentMethod = method;
    this.touch();
  }

  updateNotes(notes: string): void {
    this.props.notes = notes;
    this.touch();
  }

  isDraft(): boolean {
    return this.props.status === SaleStatus.DRAFT;
  }

  isPending(): boolean {
    return this.props.status === SaleStatus.PENDING;
  }

  isApproved(): boolean {
    return this.props.status === SaleStatus.APPROVED;
  }

  isCompleted(): boolean {
    return this.props.status === SaleStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this.props.status === SaleStatus.CANCELLED;
  }

  isRejected(): boolean {
    return this.props.status === SaleStatus.REJECTED;
  }
}
