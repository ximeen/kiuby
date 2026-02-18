import { Money } from "@domain/entities/product/value_objects/money";
import type { PaymentMethod } from "@domain/entities/sale/sale_entity";
import { Discount } from "@domain/entities/sale/value_objects/discount";
import type { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { Entity } from "@domain/shared/entity";
import type { FiscalDocumentItem } from "./fiscal_document_item_entity";
import { FiscalDocumentStatusVO } from "./value_objects/fiscal_document_status";
import type { FiscalDocumentTypeVO } from "./value_objects/fiscal_document_type";

interface FiscalDocumentProps {
  type: FiscalDocumentTypeVO;
  series: number;
  number: number;
  accessKey?: string;
  status: FiscalDocumentStatusVO;
  issueDate: Date;
  entryDate?: Date;
  customerId?: string;
  customerName?: string;
  customerDocument?: string;
  supplierId?: string;
  supplierName?: string;
  supplierDocument?: string;
  supplierState?: string;
  saleId?: string;
  warehouseId: string;
  discount: Discount;
  subtotal: Money;
  totalTax: Money;
  total: Money;
  paymentMethod?: PaymentMethod;
  items: FiscalDocumentItem[];
  notes?: string;
  cancellationReason?: string;
}

export class FiscalDocument extends Entity<FiscalDocumentProps> {
  private constructor(props: FiscalDocumentProps, id?: string) {
    super(props, id);
  }

  static create(
    props: {
      type: FiscalDocumentTypeVO;
      series: number;
      number: number;
      warehouseId: string;
      customerId?: string;
      customerName?: string;
      customerDocument?: string;
      supplierId?: string;
      supplierName?: string;
      supplierDocument?: string;
      supplierState?: string;
      saleId?: string;
      paymentMethod?: PaymentMethod;
      notes?: string;
      items?: FiscalDocumentItem[];
      status?: FiscalDocumentStatusVO;
      issueDate?: Date;
      entryDate?: Date;
      discount?: Discount;
      subtotal?: Money;
      totalTax?: Money;
      total?: Money;
    },
    id?: string,
  ): FiscalDocument {
    if (props.series <= 0) {
      throw new Error("Series must be greater than zero");
    }
    if (props.number <= 0) {
      throw new Error("Number must be greater than zero");
    }

    return new FiscalDocument(
      {
        type: props.type,
        series: props.series,
        number: props.number,
        status: props.status ?? FiscalDocumentStatusVO.createDraft(),
        issueDate: props.issueDate ?? new Date(),
        entryDate: props.entryDate,
        warehouseId: props.warehouseId,
        discount: props.discount ?? Discount.none(),
        subtotal: props.subtotal ?? Money.create(0),
        totalTax: props.totalTax ?? Money.create(0),
        total: props.total ?? Money.create(0),
        customerId: props.customerId,
        customerName: props.customerName,
        customerDocument: props.customerDocument,
        supplierId: props.supplierId,
        supplierName: props.supplierName,
        supplierDocument: props.supplierDocument,
        supplierState: props.supplierState,
        saleId: props.saleId,
        paymentMethod: props.paymentMethod,
        notes: props.notes,
        items: props.items ?? [],
      },
      id,
    );
  }

  get type(): FiscalDocumentTypeVO {
    return this.props.type;
  }

  get series(): number {
    return this.props.series;
  }

  get number(): number {
    return this.props.number;
  }

  get accessKey(): string | undefined {
    return this.props.accessKey;
  }

  get status(): FiscalDocumentStatusVO {
    return this.props.status;
  }

  get issueDate(): Date {
    return this.props.issueDate;
  }

  get entryDate(): Date | undefined {
    return this.props.entryDate;
  }

  get customerId(): string | undefined {
    return this.props.customerId;
  }

  get customerName(): string | undefined {
    return this.props.customerName;
  }

  get customerDocument(): string | undefined {
    return this.props.customerDocument;
  }

  get supplierId(): string | undefined {
    return this.props.supplierId;
  }

  get supplierName(): string | undefined {
    return this.props.supplierName;
  }

  get supplierDocument(): string | undefined {
    return this.props.supplierDocument;
  }

  get supplierState(): string | undefined {
    return this.props.supplierState;
  }

  get saleId(): string | undefined {
    return this.props.saleId;
  }

  get warehouseId(): string {
    return this.props.warehouseId;
  }

  get discount(): Discount {
    return this.props.discount;
  }

  get subtotal(): Money {
    return this.props.subtotal;
  }

  get totalTax(): Money {
    return this.props.totalTax;
  }

  get total(): Money {
    return this.props.total;
  }

  get paymentMethod(): PaymentMethod | undefined {
    return this.props.paymentMethod;
  }

  get items(): FiscalDocumentItem[] {
    return [...this.props.items];
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get cancellationReason(): string | undefined {
    return this.props.cancellationReason;
  }

  getDocumentNumber(): string {
    return `${this.props.series}-${this.props.number.toString().padStart(9, "0")}`;
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

  getTotalTax(): Money {
    if (this.props.items.length === 0) {
      return Money.create(0);
    }
    return this.props.items.reduce((total, item) => {
      return total.add(item.getTotalTax());
    }, Money.create(0));
  }

  getTotal(): Money {
    const subtotal = this.getSubtotal();
    const itemsDiscount = this.getItemsDiscount();
    const documentDiscount = this.props.discount.apply(subtotal.amount - itemsDiscount);
    const afterDiscount = subtotal.amount - itemsDiscount - documentDiscount;
    const totalTax = this.getTotalTax().amount;
    return Money.create(Math.max(0, afterDiscount + totalTax), subtotal.currency);
  }

  calculateTotals(): void {
    this.props.subtotal = this.getSubtotal();
    this.props.totalTax = this.getTotalTax();
    this.props.total = this.getTotal();
  }

  addItem(item: FiscalDocumentItem): void {
    if (!this.canModifyItems()) {
      throw new Error("Cannot modify items in current status");
    }
    this.props.items.push(item);
    this.calculateTotals();
    this.touch();
  }

  removeItem(itemId: string): void {
    if (!this.canModifyItems()) {
      throw new Error("Cannot modify items in current status");
    }
    const index = this.props.items.findIndex((i) => i.id === itemId);
    if (index === -1) {
      throw new Error("Item not found");
    }
    this.props.items.splice(index, 1);
    this.calculateTotals();
    this.touch();
  }

  updateItemQuantity(itemId: string, quantity: Quantity): void {
    if (!this.canModifyItems()) {
      throw new Error("Cannot modify items in current status");
    }
    const item = this.props.items.find((i) => i.id === itemId);
    if (!item) {
      throw new Error("Item not found");
    }
    item.updateQuantity(quantity);
    this.calculateTotals();
    this.touch();
  }

  applyDiscount(discount: Discount): void {
    if (!this.canModifyItems()) {
      throw new Error("Cannot modify discount in current status");
    }
    this.props.discount = discount;
    this.calculateTotals();
    this.touch();
  }

  canModifyItems(): boolean {
    return this.props.status.isDraft();
  }

  canIssue(): boolean {
    if (!this.props.status.isDraft()) {
      return false;
    }
    if (this.props.items.length === 0) {
      return false;
    }
    return true;
  }

  canCancel(): boolean {
    return this.props.status.isIssued();
  }

  issue(accessKey: string): void {
    if (!this.canIssue()) {
      throw new Error("Cannot issue fiscal document in current status");
    }
    if (!accessKey || accessKey.length < 44) {
      throw new Error("Invalid access key");
    }
    this.props.accessKey = accessKey;
    this.props.status = FiscalDocumentStatusVO.createIssued();
    this.props.issueDate = new Date();
    this.calculateTotals();
    this.touch();
  }

  cancel(reason: string): void {
    if (!this.canCancel()) {
      throw new Error("Cannot cancel fiscal document in current status");
    }
    if (!reason || reason.trim().length === 0) {
      throw new Error("Cancellation reason is required");
    }
    this.props.status = FiscalDocumentStatusVO.createCancelled(reason);
    this.props.cancellationReason = reason;
    this.touch();
  }

  setEntryDate(date: Date): void {
    if (!this.props.type.isInput()) {
      throw new Error("Entry date is only for input documents");
    }
    this.props.entryDate = date;
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
    return this.props.status.isDraft();
  }

  isIssued(): boolean {
    return this.props.status.isIssued();
  }

  isCancelled(): boolean {
    return this.props.status.isCancelled();
  }

  isInput(): boolean {
    return this.props.type.isInput();
  }

  isOutput(): boolean {
    return this.props.type.isOutput();
  }

  isLinkedToSale(): boolean {
    return !!this.props.saleId;
  }
}
