import { beforeEach, describe, expect, it } from "vitest";
import type { Email } from "../customers/value_objects/email";
import { Permission } from "./permissions";
import { User, UserRole, UserStatus } from "./user_entity";
import type { Password } from "./value_objects/password";
import type { Username } from "./value_objects/username";

const createMockEmail = (value: string): Email => ({ value }) as Email;
const createMockUsername = (value: string): Username => ({ value }) as Username;
const createMockPassword = (hash: string): Password => ({ hash }) as Password;

describe("User", () => {
  let validProps: Parameters<typeof User.create>[0];

  beforeEach(() => {
    validProps = {
      name: "John Doe",
      username: createMockUsername("johndoe"),
      email: createMockEmail("john@example.com"),
      password: createMockPassword("hash123"),
      role: UserRole.ADMIN,
    };
  });

  describe("create", () => {
    it("deve criar usuário com status ACTIVE por padrão", () => {
      const user = User.create(validProps);
      expect(user.status).toBe(UserStatus.ACTIVE);
      expect(user.isActive()).toBe(true);
    });

    it("deve criar usuário com status específico", () => {
      const user = User.create({ ...validProps, status: UserStatus.INACTIVE });
      expect(user.status).toBe(UserStatus.INACTIVE);
    });

    it("deve criar usuário com campos opcionais", () => {
      const user = User.create({
        ...validProps,
        phone: "11999999999",
      });
      expect(user.phone).toBe("11999999999");
    });

    it("deve remover espaços do nome", () => {
      const user = User.create({ ...validProps, name: "  John Doe  " });
      expect(user.name).toBe("John Doe");
    });

    it("deve lançar erro se nome estiver vazio", () => {
      expect(() => User.create({ ...validProps, name: "" })).toThrow("User name is required");
    });

    it("deve lançar erro se nome tiver menos de 3 caracteres", () => {
      expect(() => User.create({ ...validProps, name: "Jo" })).toThrow(
        "User name must be at least 3 characters",
      );
    });
  });

  describe("status management", () => {
    it("deve ativar usuário", () => {
      const user = User.create({ ...validProps, status: UserStatus.INACTIVE });
      user.activate();
      expect(user.status).toBe(UserStatus.ACTIVE);
      expect(user.isActive()).toBe(true);
    });

    it("deve desativar usuário", () => {
      const user = User.create(validProps);
      user.deactivate();
      expect(user.status).toBe(UserStatus.INACTIVE);
    });

    it("deve bloquear usuário", () => {
      const user = User.create(validProps);
      user.block();
      expect(user.status).toBe(UserStatus.BLOCKED);
      expect(user.isBlocked()).toBe(true);
    });
  });

  describe("role checks", () => {
    it("deve verificar se é admin", () => {
      const user = User.create({ ...validProps, role: UserRole.ADMIN });
      expect(user.isAdmin()).toBe(true);
      expect(user.canManagerUsers()).toBe(true);
    });

    it("deve verificar se é manager", () => {
      const user = User.create({ ...validProps, role: UserRole.MANAGER });
      expect(user.isManager()).toBe(true);
      expect(user.canCreateSales()).toBe(true);
    });

    it("deve verificar se é salesperson", () => {
      const user = User.create({ ...validProps, role: UserRole.SALESPERSON });
      expect(user.isSalesperson()).toBe(true);
      expect(user.canCreateSales()).toBe(true);
    });

    it("deve verificar se é stock manager", () => {
      const user = User.create({ ...validProps, role: UserRole.STOCK_MANAGER });
      expect(user.isStockManager()).toBe(true);
      expect(user.canManagerStock()).toBe(true);
    });

    it("deve verificar se é viewer", () => {
      const user = User.create({ ...validProps, role: UserRole.VIEWER });
      expect(user.isViewer()).toBe(true);
      expect(user.canCreateSales()).toBe(false);
    });
  });

  describe("permissions", () => {
    it("deve retornar permissões de admin", () => {
      const user = User.create({ ...validProps, role: UserRole.ADMIN });
      const permissions = user.getPermissions();
      expect(permissions).toContain("manage_users");
      expect(permissions).toContain("manage_products");
      expect(permissions).toContain("create_sale");
    });

    it("deve retornar permissões de salesperson", () => {
      const user = User.create({ ...validProps, role: UserRole.SALESPERSON });
      const permissions = user.getPermissions();
      expect(permissions).toContain("manage_customers");
      expect(permissions).toContain("create_sale");
      expect(permissions).not.toContain("manage_users");
    });

    it("deve retornar permissões vazias para viewer", () => {
      const user = User.create({ ...validProps, role: UserRole.VIEWER });
      expect(user.getPermissions()).toHaveLength(0);
    });

    it("deve verificar se tem permissão", () => {
      const user = User.create({ ...validProps, role: UserRole.ADMIN });
      expect(user.hasPermission(Permission.MANAGE_USERS)).toBe(true);
    });
  });

  describe("updateName", () => {
    it("deve atualizar nome", () => {
      const user = User.create(validProps);
      user.updateName("Jane Doe");
      expect(user.name).toBe("Jane Doe");
    });

    it("deve lançar erro se nome estiver vazio", () => {
      const user = User.create(validProps);
      expect(() => user.updateName("")).toThrow("Name cannot be empty");
    });
  });

  describe("updateEmail", () => {
    it("deve atualizar email", () => {
      const user = User.create(validProps);
      const newEmail = createMockEmail("jane@example.com");
      user.updateEmail(newEmail);
      expect(user.email).toBe(newEmail);
    });
  });

  describe("updatePhone", () => {
    it("deve atualizar telefone", () => {
      const user = User.create(validProps);
      user.updatePhone("11988887777");
      expect(user.phone).toBe("11988887777");
    });

    it("deve remover telefone se undefined", () => {
      const user = User.create({ ...validProps, phone: "11999999999" });
      user.updatePhone(undefined);
      expect(user.phone).toBeUndefined();
    });
  });

  describe("changeRole", () => {
    it("deve alterar role", () => {
      const user = User.create(validProps);
      user.changeRole(UserRole.MANAGER);
      expect(user.role).toBe(UserRole.MANAGER);
    });
  });

  describe("recordLogin", () => {
    it("deve registrar login", () => {
      const user = User.create(validProps);
      user.recordLogin();
      expect(user.lastLoginAt).toBeInstanceOf(Date);
    });
  });
});
