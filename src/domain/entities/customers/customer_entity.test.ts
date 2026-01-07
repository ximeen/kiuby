import { beforeEach, describe, expect, it } from "vitest";
import { Customer, CustomerStatus, CustomerType } from "./customer_entity";
import type { Address } from "./value_objects/address";
import type { Document } from "./value_objects/document";
import type { Email } from "./value_objects/email";
import type { Phone } from "./value_objects/phone";

const createMockEmail = (value: string): Email => ({ value }) as Email;
const createMockPhone = (value: string): Phone => ({ value }) as Phone;
const createMockAddress = (street: string): Address => ({ street }) as Address;
const createMockDocument = (value: string, type: "CPF" | "CNPJ"): Document =>
  ({
    value,
    isCPF: () => type === "CPF",
    isCNPJ: () => type === "CNPJ",
  }) as Document;

describe("Customer", () => {
  let validIndividualProps: any;
  let validCompanyProps: any;

  beforeEach(() => {
    validIndividualProps = {
      name: "João Silva",
      type: CustomerType.INDIVIDUAL,
      document: createMockDocument("12345678900", "CPF"),
    };

    validCompanyProps = {
      name: "Empresa XYZ",
      type: CustomerType.COMPANY,
      companyName: "XYZ Ltda",
      document: createMockDocument("12345678000100", "CNPJ"),
    };
  });

  describe("create", () => {
    it("deve criar cliente individual com status ACTIVE por padrão", () => {
      const customer = Customer.create(validIndividualProps);

      expect(customer.name).toBe("João Silva");
      expect(customer.type).toBe(CustomerType.INDIVIDUAL);
      expect(customer.status).toBe(CustomerStatus.ACTIVE);
      expect(customer.currentDebt).toBe(0);
      expect(customer.isIndividual()).toBe(true);
      expect(customer.isActive()).toBe(true);
    });

    it("deve criar cliente empresa", () => {
      const customer = Customer.create(validCompanyProps);

      expect(customer.name).toBe("Empresa XYZ");
      expect(customer.companyName).toBe("XYZ Ltda");
      expect(customer.type).toBe(CustomerType.COMPANY);
      expect(customer.isCompany()).toBe(true);
    });

    it("deve remover espaços do nome", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        name: "  João Silva  ",
      });

      expect(customer.name).toBe("João Silva");
    });

    it("deve criar com status específico", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        status: CustomerStatus.INACTIVE,
      });

      expect(customer.status).toBe(CustomerStatus.INACTIVE);
    });

    it("deve criar com campos opcionais", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        email: createMockEmail("joao@example.com"),
        phone: createMockPhone("11999999999"),
        address: createMockAddress("Rua A"),
        birthdate: new Date("1990-01-01"),
        notes: "Cliente VIP",
        creditLimit: 5000,
        currentDebt: 1000,
      });

      expect(customer.email?.value).toBe("joao@example.com");
      expect(customer.phone?.value).toBe("11999999999");
      expect(customer.notes).toBe("Cliente VIP");
      expect(customer.creditLimit).toBe(5000);
      expect(customer.currentDebt).toBe(1000);
    });
  });

  describe("validações de criação", () => {
    it("deve lançar erro se nome estiver vazio", () => {
      expect(() => Customer.create({ ...validIndividualProps, name: "" })).toThrow(
        "Customer name is required",
      );
    });

    it("deve lançar erro se nome tiver apenas espaços", () => {
      expect(() => Customer.create({ ...validIndividualProps, name: "   " })).toThrow(
        "Customer name is required",
      );
    });

    it("deve lançar erro se nome tiver menos de 3 caracteres", () => {
      expect(() => Customer.create({ ...validIndividualProps, name: "Jo" })).toThrow(
        "Customer name must be at least 3 characters",
      );
    });

    it("deve lançar erro se empresa não tiver companyName", () => {
      expect(() =>
        Customer.create({
          name: "Empresa",
          type: CustomerType.COMPANY,
          document: createMockDocument("12345678000100", "CNPJ"),
        }),
      ).toThrow("Company name is required for company type");
    });

    it("deve lançar erro se cliente individual tiver CNPJ", () => {
      expect(() =>
        Customer.create({
          ...validIndividualProps,
          document: createMockDocument("12345678000100", "CNPJ"),
        }),
      ).toThrow("Individual customers must have CPF");
    });

    it("deve lançar erro se empresa tiver CPF", () => {
      expect(() =>
        Customer.create({
          ...validCompanyProps,
          document: createMockDocument("12345678900", "CPF"),
        }),
      ).toThrow("Company customers must have CNPJ");
    });

    it("deve lançar erro se creditLimit for negativo", () => {
      expect(() => Customer.create({ ...validIndividualProps, creditLimit: -100 })).toThrow(
        "Credit limit cannot be negative",
      );
    });
  });

  describe("updateName", () => {
    it("deve atualizar nome", () => {
      const customer = Customer.create(validIndividualProps);

      customer.updateName("Maria Santos");

      expect(customer.name).toBe("Maria Santos");
    });

    it("deve remover espaços ao atualizar", () => {
      const customer = Customer.create(validIndividualProps);

      customer.updateName("  Maria Santos  ");

      expect(customer.name).toBe("Maria Santos");
    });

    it("deve lançar erro se nome estiver vazio", () => {
      const customer = Customer.create(validIndividualProps);

      expect(() => customer.updateName("")).toThrow("Name cannot be empty");
      expect(() => customer.updateName("  ")).toThrow("Name cannot be empty");
    });
  });

  describe("atualizações de contato", () => {
    it("deve atualizar email", () => {
      const customer = Customer.create(validIndividualProps);
      const newEmail = createMockEmail("novo@example.com");

      customer.updateEmail(newEmail);

      expect(customer.email).toBe(newEmail);
    });

    it("deve atualizar telefone", () => {
      const customer = Customer.create(validIndividualProps);
      const newPhone = createMockPhone("11988888888");

      customer.updatePhone(newPhone);

      expect(customer.phone).toBe(newPhone);
    });

    it("deve atualizar endereço", () => {
      const customer = Customer.create(validIndividualProps);
      const newAddress = createMockAddress("Rua B");

      customer.updateAddress(newAddress);

      expect(customer.address).toBe(newAddress);
    });

    it("deve atualizar notas", () => {
      const customer = Customer.create(validIndividualProps);

      customer.updateNotes("  Cliente preferencial  ");

      expect(customer.notes).toBe("Cliente preferencial");
    });
  });

  describe("gestão de status", () => {
    it("deve ativar cliente", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        status: CustomerStatus.INACTIVE,
      });

      customer.activate();

      expect(customer.status).toBe(CustomerStatus.ACTIVE);
      expect(customer.isActive()).toBe(true);
    });

    it("deve desativar cliente", () => {
      const customer = Customer.create(validIndividualProps);

      customer.deactivate();

      expect(customer.status).toBe(CustomerStatus.INACTIVE);
      expect(customer.isActive()).toBe(false);
    });

    it("deve bloquear cliente", () => {
      const customer = Customer.create(validIndividualProps);

      customer.block();

      expect(customer.status).toBe(CustomerStatus.BLOCKED);
      expect(customer.isBlocked()).toBe(true);
    });
  });

  describe("gestão de crédito", () => {
    it("deve definir limite de crédito", () => {
      const customer = Customer.create(validIndividualProps);

      customer.setCreditLimit(10000);

      expect(customer.creditLimit).toBe(10000);
    });

    it("deve lançar erro ao definir limite negativo", () => {
      const customer = Customer.create(validIndividualProps);

      expect(() => customer.setCreditLimit(-100)).toThrow("Credit limit cannot be negative");
    });

    it("deve calcular crédito disponível", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        creditLimit: 5000,
        currentDebt: 2000,
      });

      expect(customer.getAvailableCredit()).toBe(3000);
    });

    it("deve retornar 0 se não tiver limite de crédito", () => {
      const customer = Customer.create(validIndividualProps);

      expect(customer.getAvailableCredit()).toBe(0);
    });

    it("deve retornar 0 se dívida exceder limite", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        creditLimit: 1000,
        currentDebt: 1500,
      });

      expect(customer.getAvailableCredit()).toBe(0);
    });

    it("deve verificar se tem crédito disponível", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        creditLimit: 5000,
        currentDebt: 2000,
      });

      expect(customer.hasAvailableCredit(2000)).toBe(true);
      expect(customer.hasAvailableCredit(3000)).toBe(true);
      expect(customer.hasAvailableCredit(3001)).toBe(false);
    });

    it("deve retornar false se não tiver limite", () => {
      const customer = Customer.create(validIndividualProps);

      expect(customer.hasAvailableCredit(100)).toBe(false);
    });
  });

  describe("gestão de dívida", () => {
    it("deve adicionar dívida", () => {
      const customer = Customer.create(validIndividualProps);

      customer.addDebt(1000);

      expect(customer.currentDebt).toBe(1000);
    });

    it("deve acumular dívidas", () => {
      const customer = Customer.create(validIndividualProps);

      customer.addDebt(500);
      customer.addDebt(300);

      expect(customer.currentDebt).toBe(800);
    });

    it("deve lançar erro ao adicionar dívida zero ou negativa", () => {
      const customer = Customer.create(validIndividualProps);

      expect(() => customer.addDebt(0)).toThrow("Debt amount must be positive");
      expect(() => customer.addDebt(-100)).toThrow("Debt amount must be positive");
    });

    it("deve reduzir dívida", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        currentDebt: 1000,
      });

      customer.reduceDebt(300);

      expect(customer.currentDebt).toBe(700);
    });

    it("deve lançar erro ao reduzir com valor zero ou negativo", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        currentDebt: 1000,
      });

      expect(() => customer.reduceDebt(0)).toThrow("Payment amount must be positive");
      expect(() => customer.reduceDebt(-100)).toThrow("Payment amount must be positive");
    });

    it("deve lançar erro ao reduzir mais que a dívida", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        currentDebt: 500,
      });

      expect(() => customer.reduceDebt(600)).toThrow("Payment amount exceeds current debt");
    });

    it("deve zerar dívida ao pagar exatamente o valor", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        currentDebt: 500,
      });

      customer.reduceDebt(500);

      expect(customer.currentDebt).toBe(0);
    });
  });

  describe("canPurchase", () => {
    it("deve retornar false se cliente estiver bloqueado", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        status: CustomerStatus.BLOCKED,
        creditLimit: 5000,
      });

      expect(customer.canPurchase(100)).toBe(false);
    });

    it("deve retornar false se cliente estiver inativo", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        status: CustomerStatus.INACTIVE,
        creditLimit: 5000,
      });

      expect(customer.canPurchase(100)).toBe(false);
    });

    it("deve retornar true se tiver crédito disponível", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        creditLimit: 5000,
        currentDebt: 2000,
      });

      expect(customer.canPurchase(2000)).toBe(true);
    });

    it("deve retornar false se não tiver crédito suficiente", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        creditLimit: 5000,
        currentDebt: 4500,
      });

      expect(customer.canPurchase(1000)).toBe(false);
    });

    it("deve retornar true se não tiver limite de crédito definido", () => {
      const customer = Customer.create(validIndividualProps);

      expect(customer.canPurchase(10000)).toBe(true);
    });
  });

  describe("cenários de uso real", () => {
    it("deve gerenciar ciclo completo de crédito", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        creditLimit: 10000,
      });

      customer.addDebt(3000);
      expect(customer.getAvailableCredit()).toBe(7000);

      customer.addDebt(2000);
      expect(customer.getAvailableCredit()).toBe(5000);

      customer.reduceDebt(4000);
      expect(customer.getAvailableCredit()).toBe(9000);
      expect(customer.currentDebt).toBe(1000);
    });

    it("deve impedir compra acima do limite", () => {
      const customer = Customer.create({
        ...validIndividualProps,
        creditLimit: 1000,
      });

      expect(customer.canPurchase(500)).toBe(true);
      customer.addDebt(500);
      expect(customer.canPurchase(600)).toBe(false);
    });
  });
});
