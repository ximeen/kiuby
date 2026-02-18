import { beforeEach, describe, expect, it } from "vitest";
import type { Address } from "../customers/value_objects/address";
import { Warehouse, WarehouseStatus, WarehouseType } from "./warehouses_entity";

const createMockAddress = (street: string): Address => ({ street }) as Address;

describe("Warehouse", () => {
  let validProps: Parameters<typeof Warehouse.create>[0];

  beforeEach(() => {
    validProps = {
      name: "Warehouse Central",
      code: "WH001",
      type: WarehouseType.MAIN,
    };
  });

  describe("create", () => {
    it("deve criar warehouse com status ACTIVE por padrão", () => {
      const warehouse = Warehouse.create(validProps);
      expect(warehouse.status).toBe(WarehouseStatus.ACTIVE);
      expect(warehouse.isActive()).toBe(true);
    });

    it("deve criar warehouse com status específico", () => {
      const warehouse = Warehouse.create({ ...validProps, status: WarehouseStatus.INACTIVE });
      expect(warehouse.status).toBe(WarehouseStatus.INACTIVE);
    });

    it("deve converter código para maiúsculas", () => {
      const warehouse = Warehouse.create({ ...validProps, code: "wh001" });
      expect(warehouse.code).toBe("WH001");
    });

    it("deve criar warehouse com campos opcionais", () => {
      const warehouse = Warehouse.create({
        ...validProps,
        phone: "11999999999",
        email: "warehouse@example.com",
        capacity: 1000,
      });
      expect(warehouse.phone).toBe("11999999999");
      expect(warehouse.email).toBe("warehouse@example.com");
      expect(warehouse.capacity).toBe(1000);
    });

    it("deve lançar erro para nome vazio", () => {
      expect(() => Warehouse.create({ ...validProps, name: "" })).toThrow(
        "Warehouse name is required",
      );
    });

    it("deve lançar erro para nome com menos de 3 caracteres", () => {
      expect(() => Warehouse.create({ ...validProps, name: "AB" })).toThrow(
        "Warehouse name must be at least 3 characters",
      );
    });

    it("deve lançar erro para código vazio", () => {
      expect(() => Warehouse.create({ ...validProps, code: "" })).toThrow(
        "Warehouse code is required",
      );
    });

    it("deve lançar erro para código com menos de 2 caracteres", () => {
      expect(() => Warehouse.create({ ...validProps, code: "A" })).toThrow(
        "Warehouse code must be between 2 and 10 characters",
      );
    });

    it("deve lançar erro para código com mais de 10 caracteres", () => {
      expect(() => Warehouse.create({ ...validProps, code: "ABCD1234567" })).toThrow(
        "Warehouse code must be between 2 and 10 characters",
      );
    });

    it("deve lançar erro para código com caracteres inválidos", () => {
      expect(() => Warehouse.create({ ...validProps, code: "WH@001" })).toThrow(
        "Warehouse code can only contain letters, numbers, hyphens and undescors",
      );
    });

    it("deve lançar erro para capacidade negativa", () => {
      expect(() => Warehouse.create({ ...validProps, capacity: -1 })).toThrow(
        "Warehouse capacity cannot be negative",
      );
    });
  });

  describe("type checks", () => {
    it("deve verificar se é warehouse principal", () => {
      const warehouse = Warehouse.create({ ...validProps, type: WarehouseType.MAIN });
      expect(warehouse.isMain()).toBe(true);
      expect(warehouse.isBranch()).toBe(false);
    });

    it("deve verificar se é filial", () => {
      const warehouse = Warehouse.create({ ...validProps, type: WarehouseType.BRANCH });
      expect(warehouse.isBranch()).toBe(true);
    });

    it("deve verificar se é loja", () => {
      const warehouse = Warehouse.create({ ...validProps, type: WarehouseType.STORE });
      expect(warehouse.isStore()).toBe(true);
    });

    it("deve verificar se é centro de distribuição", () => {
      const warehouse = Warehouse.create({ ...validProps, type: WarehouseType.DISTRIBUTION });
      expect(warehouse.isDistributionCenter()).toBe(true);
    });
  });

  describe("status management", () => {
    it("deve ativar warehouse", () => {
      const warehouse = Warehouse.create({ ...validProps, status: WarehouseStatus.INACTIVE });
      warehouse.activate();
      expect(warehouse.status).toBe(WarehouseStatus.ACTIVE);
    });

    it("deve desativar warehouse", () => {
      const warehouse = Warehouse.create(validProps);
      warehouse.deactivate();
      expect(warehouse.status).toBe(WarehouseStatus.INACTIVE);
    });

    it("deve colocar em manutenção", () => {
      const warehouse = Warehouse.create(validProps);
      warehouse.putInMaintenance();
      expect(warehouse.status).toBe(WarehouseStatus.MAINTENANCE);
      expect(warehouse.isInMaintenance()).toBe(true);
    });
  });

  describe("updatedName", () => {
    it("deve atualizar nome", () => {
      const warehouse = Warehouse.create(validProps);
      warehouse.updatedName("Novo Nome");
      expect(warehouse.name).toBe("Novo Nome");
    });

    it("deve lançar erro para nome vazio", () => {
      const warehouse = Warehouse.create(validProps);
      expect(() => warehouse.updatedName("")).toThrow("Name cannot be empty");
    });
  });

  describe("updatedAddress", () => {
    it("deve atualizar endereço", () => {
      const warehouse = Warehouse.create(validProps);
      const newAddress = createMockAddress("Nova Rua");
      warehouse.updatedAddress(newAddress);
      expect(warehouse.address).toBe(newAddress);
    });
  });

  describe("updateContact", () => {
    it("deve atualizar contato", () => {
      const warehouse = Warehouse.create(validProps);
      warehouse.updateContact("11988887777", "novo@email.com");
      expect(warehouse.phone).toBe("11988887777");
      expect(warehouse.email).toBe("novo@email.com");
    });
  });

  describe("assignManager", () => {
    it("deve atribuir gerente", () => {
      const warehouse = Warehouse.create(validProps);
      warehouse.assignManager("user-123");
      expect(warehouse.managerId).toBe("user-123");
    });
  });

  describe("removeManager", () => {
    it("deve remover gerente", () => {
      const warehouse = Warehouse.create({ ...validProps, managerId: "user-123" });
      warehouse.removeManager();
      expect(warehouse.managerId).toBeUndefined();
    });
  });

  describe("setCapacity", () => {
    it("deve definir capacidade", () => {
      const warehouse = Warehouse.create(validProps);
      warehouse.setCapacity(5000);
      expect(warehouse.capacity).toBe(5000);
    });

    it("deve lançar erro para capacidade negativa", () => {
      const warehouse = Warehouse.create(validProps);
      expect(() => warehouse.setCapacity(-100)).toThrow("Capacity cannot be negative");
    });
  });
});
