import { describe, expect, it } from "vitest";
import { Phone } from "./phone";

describe("Phone", () => {
  describe("create", () => {
    it("deve criar phone com 10 dígitos", () => {
      const phone = Phone.create("11999999999");
      expect(phone.value).toBe("11999999999");
    });

    it("deve criar phone com 11 dígitos", () => {
      const phone = Phone.create("11999999999");
      expect(phone.value).toBe("11999999999");
    });

    it("deve remover caracteres não numéricos", () => {
      const phone = Phone.create("(11) 99999-9999");
      expect(phone.value).toBe("11999999999");
    });

    it("deve lançar erro para phone vazio", () => {
      expect(() => Phone.create("")).toThrow("Phone cannot be empty");
    });

    it("deve lançar erro para phone com menos de 10 dígitos", () => {
      expect(() => Phone.create("119999999")).toThrow("Phone must be have 10 or 11 digits");
    });

    it("deve lançar erro para phone com mais de 11 dígitos", () => {
      expect(() => Phone.create("11999999999999")).toThrow("Phone must be have 10 or 11 digits");
    });
  });

  describe("format", () => {
    it("deve formatar phone com 10 dígitos", () => {
      const phone = Phone.create("1199999999");
      expect(phone.format()).toBe("(11) 9999-9999");
    });

    it("deve formatar phone com 11 dígitos", () => {
      const phone = Phone.create("11999999999");
      expect(phone.format()).toBe("(11) 99999-9999");
    });
  });
});
