import { describe, expect, it } from "vitest";
import { Address } from "./address";

describe("Address", () => {
  const validProps = {
    street: "Rua doida",
    number: "157",
    neighborhood: "Bairro do misterio",
    city: "Imperatriz",
    state: "MA",
    zipCode: "65913250",
  };

  describe("create", () => {
    it("Deve criar o endereço com dados válidos", () => {
      const address = Address.create(validProps);

      expect(address.street).toBe("Rua doida");
      expect(address.number).toBe("157");
      expect(address.neighborhood).toBe("Bairro do misterio");
      expect(address.city).toBe("Imperatriz");
      expect(address.state).toBe("MA");
      expect(address.zipCode).toBe("65913250");
    });

    it("Deve definir Brasil como país padrão", () => {
      const address = Address.create(validProps);

      expect(address.country).toBe("BR");
    });

    it("Deve aceitar um país específico", () => {
      const address = Address.create({
        ...validProps,
        country: "US",
      });

      expect(address.country).toBe("US");
    });

    it("Deve criar com complemento", () => {
      const address = Address.create({
        ...validProps,
        complement: "Casa preta",
      });

      expect(address.complement).toBe("Casa preta");
    });

    it("Deve limpar os caracters não númericos no CEP", () => {
      const address = Address.create({
        ...validProps,
        zipCode: "01234-567",
      });

      expect(address.zipCode).toBe("01234567");
    });

    it("Deve aceitar CEP com pontos ou traços", () => {
      const address = Address.create({
        ...validProps,
        zipCode: "01.234-567",
      });

      expect(address.zipCode).toBe("01234567");
    });

    it("Deve aceitar CEP com espaços", () => {
      const address = Address.create({
        ...validProps,
        zipCode: "01 234 567",
      });

      expect(address.zipCode).toBe("01234567");
    });
  });

  describe("Validação de campos obrigatorios", () => {
    it("Deve lançar erro se o campo street estiver vazia", () => {
      expect(() => Address.create({ ...validProps, street: "" })).toThrow("Street is required");
    });

    it("Deve lançar erro se o campo number estiver vazio", () => {
      expect(() => Address.create({ ...validProps, number: "" })).toThrow("Number is required");
    });

    it("Deve lançar erro se o campo neighborhood estiver vazio", () => {
      expect(() => Address.create({ ...validProps, neighborhood: "" })).toThrow(
        "Neighborhood is required",
      );
    });

    it("Deve lançar erro se o campo city estiver vazio", () => {
      expect(() => Address.create({ ...validProps, city: "" })).toThrow("City is required");
    });

    it("Deve lançar erro se o campo state estiver vazio", () => {
      expect(() => Address.create({ ...validProps, state: "" })).toThrow("State is required");
    });
  });

  describe("Validações de CEP", () => {
    it("Deve lançar erro se o campo zipCode não tiver 8 digitos", () => {
      expect(() => Address.create({ ...validProps, zipCode: "1234567" })).toThrow(
        "ZipCode must have 8 digits",
      );

      expect(() => Address.create({ ...validProps, zipCode: "123456789" })).toThrow(
        "ZipCode must have 8 digits",
      );
    });

    it("Deve lançar erro se o capo zipCode estiver vazio", () => {
      expect(() => {
        Address.create({ ...validProps, zipCode: "" });
      }).toThrow("ZipCode must have 8 digits");
    });

    it("deve lançar erro se CEP tiver apenas caracteres não numéricos", () => {
      expect(() => Address.create({ ...validProps, zipCode: "ABCDEFGH" })).toThrow(
        "ZipCode must have 8 digits",
      );
    });
  });

  describe("formatZipCode", () => {
    it("deve formatar CEP com hífen", () => {
      const address = Address.create(validProps);

      expect(address.formatZipCode()).toBe("65913-250");
    });

    it("deve formatar CEP mesmo recebendo formatado", () => {
      const address = Address.create({
        ...validProps,
        zipCode: "01234-567",
      });

      expect(address.formatZipCode()).toBe("01234-567");
    });
  });
});
