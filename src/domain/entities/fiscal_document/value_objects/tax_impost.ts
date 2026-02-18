import { Money } from "@domain/entities/product/value_objects/money";
import { ValueObject } from "@domain/shared/value_object";

export enum IcmsCst {
  TRIBUTED_INTEGRALLY = "00",
  TRIBUTED_ST = "10",
  REDUCED_BASE = "20",
  EXEMPT_ST = "30",
  EXEMPT = "40",
  NOT_TRIBUTED = "41",
  SUSPENSION = "50",
  DEFERRAL = "51",
  ST_PREVIOUS = "60",
  REDUCED_ST = "70",
  OTHER = "90",
  SN_TRIBUTED = "101",
  SN_TRIBUTED_ST = "102",
  SN_EXEMPT = "103",
  SN_ST = "201",
  SN_EXEMPT_ST = "202",
  SN_ST_OTHER = "203",
  SN_REDUCED = "300",
  SN_EXEMPT_400 = "400",
  SN_NOT_TRIBUTED = "401",
  SN_SUSPENSION = "500",
  SN_ST_PREVIOUS = "600",
  SN_REDUCED_ST = "700",
  SN_OTHER = "900",
}

export enum IcmsOrigin {
  NATIONAL = 0,
  IMPORTED_DIRECT = 1,
  IMPORTED_ACQUISITION = 2,
  NATIONAL_40 = 3,
  NATIONAL_70_IMPORTED = 4,
  NATIONAL_IMPORTED_70 = 5,
  NATIONAL_IMPORTED_40 = 6,
  IMPORTED_OTHER = 7,
  IMPORTED_OTHER_2 = 8,
}

export enum PisCst {
  BASE_NORMAL = "01",
  BASE_DIFF = "02",
  QUANTITY = "03",
  UNITARY = "04",
  ST = "05",
  ALIQUOTA_ZERO = "06",
  EXEMPT = "07",
  WITHOUT_INCIDENCE = "08",
  SUSPENSION = "09",
  OTHER = "49",
  ST_PREVIOUS = "50",
  ST_OTHER = "99",
}

export enum CofinsCst {
  BASE_NORMAL = "01",
  BASE_DIFF = "02",
  QUANTITY = "03",
  UNITARY = "04",
  ST = "05",
  ALIQUOTA_ZERO = "06",
  EXEMPT = "07",
  WITHOUT_INCIDENCE = "08",
  SUSPENSION = "09",
  OTHER = "49",
  ST_PREVIOUS = "50",
  ST_OTHER = "99",
}

export enum IpiCst {
  TAXABLE = "00",
  TAXABLE_ST = "01",
  EXEMPT = "02",
  WITHOUT_INCIDENCE = "03",
  SUSPENSION = "04",
  OTHER = "99",
}

export enum IpiOrigin {
  NATIONAL = 0,
  IMPORTED_DIRECT = 1,
  IMPORTED_ACQUISITION = 2,
  NATIONAL_40 = 3,
  NATIONAL_70_IMPORTED = 4,
  NATIONAL_IMPORTED_70 = 5,
  NATIONAL_IMPORTED_40 = 6,
  IMPORTED_OTHER = 7,
  IMPORTED_OTHER_2 = 8,
}

export enum TaxType {
  ICMS = "icms",
  PIS = "pis",
  COFINS = "cofins",
  IPI = "ipi",
}

interface TaxImpostProps {
  type: TaxType;
  base: Money;
  rate: number;
  value: Money;
}

export class TaxImpost extends ValueObject<TaxImpostProps> {
  private constructor(props: TaxImpostProps) {
    super(props);
  }

  static createIcms(base: Money, rate: number, _cst: IcmsCst, _origin: IcmsOrigin): TaxImpost {
    const value = base.multiply(rate / 100);
    return new TaxImpost({
      type: TaxType.ICMS,
      base,
      rate,
      value,
    });
  }

  static createPis(base: Money, rate: number, _cst: PisCst): TaxImpost {
    const value = base.multiply(rate / 100);
    return new TaxImpost({
      type: TaxType.PIS,
      base,
      rate,
      value,
    });
  }

  static createCofins(base: Money, rate: number, _cst: CofinsCst): TaxImpost {
    const value = base.multiply(rate / 100);
    return new TaxImpost({
      type: TaxType.COFINS,
      base,
      rate,
      value,
    });
  }

  static createIpi(base: Money, rate: number, _cst: IpiCst): TaxImpost {
    const value = base.multiply(rate / 100);
    return new TaxImpost({
      type: TaxType.IPI,
      base,
      rate,
      value,
    });
  }

  static createEmpty(type: TaxType): TaxImpost {
    return new TaxImpost({
      type,
      base: Money.create(0),
      rate: 0,
      value: Money.create(0),
    });
  }

  get type(): TaxType {
    return this.props.type;
  }

  get base(): Money {
    return this.props.base;
  }

  get rate(): number {
    return this.props.rate;
  }

  get value(): Money {
    return this.props.value;
  }

  isIcms(): boolean {
    return this.props.type === TaxType.ICMS;
  }

  isPis(): boolean {
    return this.props.type === TaxType.PIS;
  }

  isCofins(): boolean {
    return this.props.type === TaxType.COFINS;
  }

  isIpi(): boolean {
    return this.props.type === TaxType.IPI;
  }

  recalculate(base: Money, rate: number): TaxImpost {
    const value = base.multiply(rate / 100);
    return new TaxImpost({
      ...this.props,
      base,
      rate,
      value,
    });
  }
}
