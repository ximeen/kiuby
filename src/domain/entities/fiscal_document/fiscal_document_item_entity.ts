import { Money } from "@domain/entities/product/value_objects/money";
import { Discount } from "@domain/entities/sale/value_objects/discount";
import type { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { Entity } from "@domain/shared/entity";
import {
  CofinsCst,
  IcmsCst,
  IcmsOrigin,
  IpiCst,
  PisCst,
  TaxImpost,
  TaxType,
} from "./value_objects/tax_impost";

interface FiscalDocumentItemProps {
  productId: string;
  productName: string;
  quantity: Quantity;
  unitPrice: Money;
  discount: Discount;
  icms: TaxImpost;
  pis: TaxImpost;
  cofins: TaxImpost;
  ipi: TaxImpost;
  icmsCst: IcmsCst;
  icmsOrigin: IcmsOrigin;
  pisCst: PisCst;
  cofinsCst: CofinsCst;
  ipiCst: IpiCst;
}

export class FiscalDocumentItem extends Entity<FiscalDocumentItemProps> {
  private constructor(props: FiscalDocumentItemProps, id?: string) {
    super(props, id);
  }

  static create(
    props: {
      productId: string;
      productName: string;
      quantity: Quantity;
      unitPrice: Money;
      discount?: Discount;
      icms?: TaxImpost;
      pis?: TaxImpost;
      cofins?: TaxImpost;
      ipi?: TaxImpost;
      icmsCst?: IcmsCst;
      icmsOrigin?: IcmsOrigin;
      pisCst?: PisCst;
      cofinsCst?: CofinsCst;
      ipiCst?: IpiCst;
    },
    id?: string,
  ): FiscalDocumentItem {
    if (props.quantity.isZero()) {
      throw new Error("Item quantity must be greater than zero");
    }
    if (props.unitPrice.amount <= 0) {
      throw new Error("Item unit price must be greater than zero");
    }

    return new FiscalDocumentItem(
      {
        productId: props.productId,
        productName: props.productName,
        quantity: props.quantity,
        unitPrice: props.unitPrice,
        discount: props.discount ?? Discount.none(),
        icms: props.icms ?? TaxImpost.createEmpty(TaxType.ICMS),
        pis: props.pis ?? TaxImpost.createEmpty(TaxType.PIS),
        cofins: props.cofins ?? TaxImpost.createEmpty(TaxType.COFINS),
        ipi: props.ipi ?? TaxImpost.createEmpty(TaxType.IPI),
        icmsCst: props.icmsCst ?? IcmsCst.TRIBUTED_INTEGRALLY,
        icmsOrigin: props.icmsOrigin ?? IcmsOrigin.NATIONAL,
        pisCst: props.pisCst ?? PisCst.BASE_NORMAL,
        cofinsCst: props.cofinsCst ?? CofinsCst.BASE_NORMAL,
        ipiCst: props.ipiCst ?? IpiCst.TAXABLE,
      },
      id,
    );
  }

  get productId(): string {
    return this.props.productId;
  }

  get productName(): string {
    return this.props.productName;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  get unitPrice(): Money {
    return this.props.unitPrice;
  }

  get discount(): Discount {
    return this.props.discount;
  }

  get icms(): TaxImpost {
    return this.props.icms;
  }

  get pis(): TaxImpost {
    return this.props.pis;
  }

  get cofins(): TaxImpost {
    return this.props.cofins;
  }

  get ipi(): TaxImpost {
    return this.props.ipi;
  }

  get icmsCst(): IcmsCst {
    return this.props.icmsCst;
  }

  get icmsOrigin(): IcmsOrigin {
    return this.props.icmsOrigin;
  }

  get pisCst(): PisCst {
    return this.props.pisCst;
  }

  get cofinsCst(): CofinsCst {
    return this.props.cofinsCst;
  }

  get ipiCst(): IpiCst {
    return this.props.ipiCst;
  }

  getSubtotal(): Money {
    return this.props.unitPrice.multiply(this.props.quantity.value);
  }

  getDiscountAmount(): number {
    return this.props.discount.calculateDiscount(this.getSubtotal().amount);
  }

  getTotalTax(): Money {
    let total = Money.create(0);
    total = total.add(this.props.icms.value);
    total = total.add(this.props.pis.value);
    total = total.add(this.props.cofins.value);
    total = total.add(this.props.ipi.value);
    return total;
  }

  getTotal(): Money {
    const subtotal = this.getSubtotal();
    const discountAmount = this.getDiscountAmount();
    const afterDiscount = Math.max(0, subtotal.amount - discountAmount);
    const total = afterDiscount + this.getTotalTax().amount;
    return Money.create(total, subtotal.currency);
  }

  updateQuantity(quantity: Quantity): void {
    if (quantity.isZero()) {
      throw new Error("Item quantity must be greater than zero");
    }
    this.props.quantity = quantity;
    this.touch();
  }

  updatePrice(price: Money): void {
    if (price.amount < 0) {
      throw new Error("Item price must be greater than zero");
    }
    this.props.unitPrice = price;
    this.touch();
  }

  applyDiscount(discount: Discount): void {
    this.props.discount = discount;
    this.touch();
  }

  updateIcms(icms: TaxImpost, cst: IcmsCst, origin: IcmsOrigin): void {
    this.props.icms = icms;
    this.props.icmsCst = cst;
    this.props.icmsOrigin = origin;
    this.touch();
  }

  updatePis(pis: TaxImpost, cst: PisCst): void {
    this.props.pis = pis;
    this.props.pisCst = cst;
    this.touch();
  }

  updateCofins(cofins: TaxImpost, cst: CofinsCst): void {
    this.props.cofins = cofins;
    this.props.cofinsCst = cst;
    this.touch();
  }

  updateIpi(ipi: TaxImpost, cst: IpiCst): void {
    this.props.ipi = ipi;
    this.props.ipiCst = cst;
    this.touch();
  }
}
