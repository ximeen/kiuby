import { ValueObject } from "@domain/shared/value_object";

export enum DocumentType {
  CPF = "cpf",
  CNPJ = "cnpj",
}

interface DocumentProps {
  value: string;
  type: DocumentType;
}

export class Document extends ValueObject<DocumentProps> {
  private constructor(props: DocumentProps) {
    super(props);
  }

  static createCPF(value: string): Document {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length !== 11) {
      throw new Error("CPF must have 11 digits");
    }
    if (!Document.isValidCPF(cleaned)) {
      throw new Error("Invalid CPF");
    }
    return new Document({ value: cleaned, type: DocumentType.CPF });
  }

  static createCNPJ(value: string): Document {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length !== 14) {
      throw new Error("CNPJ must have 14 digits");
    }
    if (!Document.isValidCNPJ(cleaned)) {
      throw new Error("CNPJ invalid");
    }
    return new Document({ value: cleaned, type: DocumentType.CNPJ });
  }

  get value(): string {
    return this.props.value;
  }

  get type(): DocumentType {
    return this.props.type;
  }

  isCPF(): boolean {
    return this.props.type === DocumentType.CPF;
  }

  isCNPJ(): boolean {
    return this.props.type === DocumentType.CNPJ;
  }

  format(): string {
    if (this.isCPF()) {
      return this.props.value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return this.props.value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }

  private static isValidCPF(cpf: string): boolean {
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    let remainder: number;
    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - 1);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  private static isValidCNPJ(cnpj: string): boolean {
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }
}
