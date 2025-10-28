import { Entity } from "@domain/shared/entity";
import type { Email } from "../customers/value_objects/email";
import { Permission } from "./permissions";
import type { Password } from "./value_objects/password";
import type { Username } from "./value_objects/username";

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  SALESPERSON = "salesperson",
  STOCK_MANAGER = "stock_manager",
  VIEWER = "viewer",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  BLOCKED = "blocked",
}

interface UserProps {
  name: string;
  username: Username;
  email: Email;
  password: Password;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  lastLoginAt?: Date;
}

export class User extends Entity<UserProps> {
  private constructor(props: UserProps, id?: string) {
    super(props, id);
  }

  static create(props: Omit<UserProps, "status"> & { status?: UserStatus }, _id?: string): User {
    if (!props.name.trim()) {
      throw new Error("User name is required");
    }

    if (props.name.trim().length < 3) {
      throw new Error("User name must be at least 3 characters");
    }

    return new User({
      ...props,
      name: props.name.trim(),
      status: props.status ?? UserStatus.ACTIVE,
    });
  }

  get name(): string {
    return this.props.name;
  }

  get username(): Username {
    return this.props.username;
  }

  get email(): Email {
    return this.props.email;
  }

  get password(): Password {
    return this.props.password;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }

  isActive(): boolean {
    return this.props.status === UserStatus.ACTIVE;
  }

  isBlocked(): boolean {
    return this.props.status === UserStatus.BLOCKED;
  }

  activate(): void {
    this.props.status = UserStatus.ACTIVE;
    this.touch();
  }

  deactivate(): void {
    this.props.status = UserStatus.INACTIVE;
  }

  block(): void {
    this.props.status = UserStatus.BLOCKED;
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }
  isManager(): boolean {
    return this.props.role === UserRole.MANAGER;
  }
  isSalesperson(): boolean {
    return this.props.role === UserRole.SALESPERSON;
  }
  isStockManager(): boolean {
    return this.props.role === UserRole.STOCK_MANAGER;
  }
  isViewer(): boolean {
    return this.props.role === UserRole.VIEWER;
  }
  canAproveSales(): boolean {
    return this.isAdmin() || this.isManager();
  }

  canCreateSales(): boolean {
    return this.isAdmin() || this.isManager() || this.isSalesperson();
  }
  canManagerStock(): boolean {
    return this.isAdmin() || this.isStockManager();
  }

  canManagerUsers(): boolean {
    return this.isAdmin();
  }
  canManagerProducts(): boolean {
    return this.isAdmin() || this.isManager() || this.isStockManager();
  }
  canManagerCustomers(): boolean {
    return this.isAdmin() || this.isManager() || this.isSalesperson();
  }
  hasPermission(permission: Permission): boolean {
    const permissions = this.getPermissions();
    return permissions.includes(permission);
  }

  getPermissions(): Permission[] {
    switch (this.props.role) {
      case UserRole.ADMIN:
        return [
          Permission.MANAGE_USERS,
          Permission.MANAGE_PRODUCTS,
          Permission.MANAGE_CUSTOMERS,
          Permission.MANAGE_STOCK,
          Permission.CREATE_SALE,
          Permission.APPROVE_SALE,
          Permission.VIEW_REPORTS,
        ];
      case UserRole.MANAGER:
        return [
          Permission.MANAGE_PRODUCTS,
          Permission.MANAGE_CUSTOMERS,
          Permission.CREATE_SALE,
          Permission.APPROVE_SALE,
          Permission.VIEW_REPORTS,
        ];
      case UserRole.SALESPERSON:
        return [Permission.MANAGE_CUSTOMERS, Permission.CREATE_SALE];
      case UserRole.STOCK_MANAGER:
        return [Permission.MANAGE_PRODUCTS, Permission.MANAGE_STOCK, Permission.VIEW_REPORTS];
      case UserRole.VIEWER:
        return [];
      default:
        return [];
    }
  }

  updateName(name: string): void {
    if (!name.trim()) {
      throw new Error("Name cannot be empty");
    }
    this.props.name = name.trim();
    this.touch();
  }
  updateEmail(email: Email): void {
    this.props.email = email;
    this.touch();
  }
  updatePhone(phone?: string): void {
    this.props.phone = phone;
    this.touch();
  }
  updatePassword(newPassword: Password): void {
    this.props.password = newPassword;
    this.touch();
  }
  changeRole(newRole: UserRole): void {
    this.props.role = newRole;
    this.touch();
  }
  verifyPassword(plainPassword: string): boolean {
    return this.props.password.verify(plainPassword);
  }
  recordLogin(): void {
    this.props.lastLoginAt = new Date();
    this.touch();
  }
}
