import { Entity } from "@domain/shared/entity";
import { Address } from "../customers/value_objects/address";

export enum WarehouseType {
  MAIN = "main",
  BRANCH = "branch",
  STORE = "store",
  DISTRIBUTION = "distribution",
}

export enum WarehouseStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
}

interface WarehouseProps {
  name: string;
  code: string;
  type: WarehouseType;
  status: WarehouseStatus;
  address?: Address;
  phone?: string;
  email?: string;
  managerId?: string;
  capacity?: number;
  notes?: string;
}

export class Warehouse extends Entity<WarehouseProps> {
  private constructor(props: WarehouseProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<WarehouseProps, "status"> & { status?: WarehouseStatus },
    id?: string,
  ): Warehouse {
    if (!props.name.trim()) {
      throw new Error("Warehouse name is required");
    }

    if (props.name.trim().length < 3) {
      throw new Error("Warehouse name must be at least 3 characters");
    }

    if (!props.code.trim()) {
      throw new Error("Warehouse code is required");
    }

    const code = props.code.trim().toUpperCase();

    if (code.length < 2 || code.length > 10) {
      throw new Error("Warehouse code must be between 2 and 10 characters");
    }

    if (!/^[A-Z0-9-_]+$/.test(code)) {
      throw new Error("Warehouse code can only contain letters, numbers, hyphens and undescors");
    }

    if (props.capacity !== undefined && props.capacity < 0) {
      throw new Error("Warehouse capacity cannot be negative");
    }

    return new Warehouse({
      ...props,
      name: props.name.trim(),
      code,
      status: props.status ?? WarehouseStatus.ACTIVE,
    });
  }

  get name(): string {
    return this.props.name;
  }

  get code(): string {
    return this.props.code;
  }

  get type(): WarehouseType {
    return this.props.type;
  }

  get status(): WarehouseStatus {
    return this.props.status;
  }

  get address(): Address | undefined {
    return this.props.address;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get managerId(): string | undefined {
    return this.props.managerId;
  }

  get capacity(): number | undefined {
    return this.props.capacity;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  isActive(): boolean {
    return this.props.status === WarehouseStatus.ACTIVE;
  }

  isInMaintenance(): boolean {
    return this.props.status === WarehouseStatus.MAINTENANCE;
  }

  updatedName(name: string): void {
    if (!name.trim()) {
      throw new Error("Name cannot be empty");
    }

    this.props.name = name.trim();
    this.touch();
  }

  updatedAddress(address: Address): void {
    this.props.address = address;
    this.touch();
  }

  updateContact(phone?: string, email?: string): void {
    this.props.phone = phone?.trim();
    this.props.email = email?.trim();

    this.touch();
  }

  assignManager(managerId: string): void {
    this.props.managerId = managerId;
    this.touch();
  }

  removeManager(): void {
    this.props.managerId = undefined;
    this.touch();
  }

  setCapacity(capacity: number): void {
    if (capacity < 0) {
      throw new Error("Capacity cannot be negative");
    }

    this.props.capacity = capacity;
    this.touch();
  }

  activate(): void {
    this.props.status = WarehouseStatus.ACTIVE;
    this.touch();
  }

  deactivate(): void {
    this.props.status = WarehouseStatus.INACTIVE;
    this.touch();
  }

  putInMaintenance(): void {
    this.props.status = WarehouseStatus.MAINTENANCE;
    this.touch();
  }

  updateNotes(notes: string): void {
    this.props.notes = notes.trim();
    this.touch();
  }

  isMain(): boolean {
    return this.props.type === WarehouseType.MAIN;
  }

  isBranch(): boolean {
    return this.props.type === WarehouseType.BRANCH;
  }

  isStore(): boolean {
    return this.props.type === WarehouseType.STORE;
  }

  isDistributionCenter(): boolean {
    return this.props.type === WarehouseType.DISTRIBUTION;
  }
}
