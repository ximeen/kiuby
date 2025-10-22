import { Entity } from "@domain/shared/entity";
import type { Money } from "./value_objects/money";
import type { ProductName } from "./value_objects/product_name";
import type { SKU } from "./value_objects/sku";

export enum ProductStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  DISCONTINUED = "discontinued",
}

interface ProductProps {
  name: ProductName;
  description?: string;
  sku: SKU;
  price: Money;
  costPrice?: Money;
  status: ProductStatus;
  categoryId?: string;
  minStockLevel: number;
  maxStockLevel?: number;
  unit: string;
}

export class Product extends Entity<ProductProps> {
  private constructor(props: ProductProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<ProductProps, "status"> & { status?: ProductStatus },
    id?: string,
  ): Product {
    return new Product(
      {
        ...props,
        status: props.status ?? ProductStatus.ACTIVE,
      },
      id,
    );
  }
  get name(): ProductName {
    return this.props.name;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get sku(): SKU {
    return this.props.sku;
  }

  get price(): Money {
    return this.props.price;
  }

  get costPrice(): Money | undefined {
    return this.props.costPrice;
  }

  get status(): ProductStatus {
    return this.props.status;
  }

  get categoryId(): string | undefined {
    return this.props.categoryId;
  }

  get minStockLevel(): number {
    return this.props.minStockLevel;
  }

  get maxStockLevel(): number | undefined {
    return this.props.maxStockLevel;
  }

  get unit(): string {
    return this.props.unit;
  }

  updatePrice(newPrice: Money): void {
    if (newPrice.amount <= 0) {
      throw new Error("Price must be greater than zero");
    }
    this.props.price = newPrice;
    this.touch();
  }

  updateCostPrice(newCostPrice: Money): void {
    this.props.costPrice = newCostPrice;
    this.touch();
  }

  calculateProfitMargin(): number {
    if (!this.props.costPrice) {
      throw new Error("Cannot calculate profit margin without cost price");
    }
    const profit = this.props.price.subtract(this.props.costPrice);
    return (profit.amount / this.props.costPrice.amount) * 100;
  }

  activate(): void {
    if (this.props.status === ProductStatus.DISCONTINUED) {
      throw new Error("Cannot activate a discontinued product");
    }
    this.props.status = ProductStatus.ACTIVE;
    this.touch();
  }

  deactivate(): void {
    this.props.status = ProductStatus.INACTIVE;
    this.touch();
  }

  discontinue(): void {
    this.props.status = ProductStatus.DISCONTINUED;
    this.touch();
  }

  isActive(): boolean {
    return this.props.status === ProductStatus.ACTIVE;
  }

  updateDescription(description: string): void {
    this.props.description = description.trim();
    this.touch();
  }

  updateStockLevels(min: number, max?: number): void {
    if (min < 0) {
      throw new Error("Minimum stock level cannot be negative");
    }
    if (max !== undefined && max < min) {
      throw new Error("Maximum stock level cannot be less than minimum");
    }
    this.props.minStockLevel = min;
    this.props.maxStockLevel = max;
    this.touch();
  }
}
