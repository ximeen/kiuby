import { ValueObject } from "@domain/shared/value_object";

interface AddressProps {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export class Address extends ValueObject<AddressProps> {
  private constructor(props: AddressProps) {
    super(props);
  }
  static create(props: AddressProps): Address {
    if (!props.street?.trim()) {
      throw new Error("Street is required");
    }
    if (!props.number?.trim()) {
      throw new Error("Number is required");
    }
    if (!props.neighborhood?.trim()) {
      throw new Error("Neighborhood is required");
    }
    if (!props.city?.trim()) {
      throw new Error("City is required");
    }
    if (!props.state?.trim()) {
      throw new Error("State is required");
    }

    const cleanedZipCode = props.zipCode.replace(/\D/g, "");
    if (cleanedZipCode.length !== 8) {
      throw new Error("ZipCode must have 8 digits");
    }
    return new Address({
      ...props,
      zipCode: cleanedZipCode,
      country: props.country || "BR",
    });
  }
  get street(): string {
    return this.props.street;
  }

  get number(): string {
    return this.props.number;
  }

  get complement(): string | undefined {
    return this.props.complement;
  }

  get neighborhood(): string {
    return this.props.neighborhood;
  }

  get city(): string {
    return this.props.city;
  }

  get state(): string {
    return this.props.state;
  }

  get zipCode(): string {
    return this.props.zipCode;
  }

  get country(): string | undefined {
    return this.props.country;
  }

  formatZipCode(): string {
    return this.props.zipCode.replace(/(\d{5})(\d{3})/, "$1-$2");
  }

  getFullAddress(): string {
    const parts = [
      `${this.street}, ${this.number}`,
      this.complement,
      this.neighborhood,
      `${this.city} - ${this.state}`,
      `CEP: ${this.formatZipCode()}`,
    ].filter(Boolean);

    return parts.join(", ");
  }
}
