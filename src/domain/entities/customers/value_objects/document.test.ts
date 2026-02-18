import { describe, expect, it } from "vitest";
import { Document, DocumentType } from "./document";

describe("Document", () => {
  describe("createCPF", () => {
    it("deve criar CPF válido", () => {
      const cpf = Document.createCPF("11144477735");
      expect(cpf.value).toBe("11144477735");
      expect(cpf.type).toBe(DocumentType.CPF);
      expect(cpf.isCPF()).toBe(true);
      expect(cpf.isCNPJ()).toBe(false);
    });

    it("deve remover caracteres não numéricos", () => {
      const cpf = Document.createCPF("111.444.777-35");
      expect(cpf.value).toBe("11144477735");
    });

    it("deve lançar erro para CPF com menos de 11 dígitos", () => {
      expect(() => Document.createCPF("1234567890")).toThrow("CPF must have 11 digits");
    });

    it("deve lançar erro para CPF com mais de 11 dígitos", () => {
      expect(() => Document.createCPF("123456789012")).toThrow("CPF must have 11 digits");
    });

    it("deve lançar erro para CPF inválido (dígitos repetidos)", () => {
      expect(() => Document.createCPF("11111111111")).toThrow("Invalid CPF");
    });

    it("deve lançar erro para CPF com dígitos verificadores inválidos", () => {
      expect(() => Document.createCPF("12345678900")).toThrow("Invalid CPF");
    });
  });

  describe("createCNPJ", () => {
    it("deve criar CNPJ válido", () => {
      const cnpj = Document.createCNPJ("11222333000181");
      expect(cnpj.value).toBe("11222333000181");
      expect(cnpj.type).toBe(DocumentType.CNPJ);
      expect(cnpj.isCNPJ()).toBe(true);
      expect(cnpj.isCPF()).toBe(false);
    });

    it("deve remover caracteres não numéricos", () => {
      const cnpj = Document.createCNPJ("11.222.333/0001-81");
      expect(cnpj.value).toBe("11222333000181");
    });

    it("deve lançar erro para CNPJ com menos de 14 dígitos", () => {
      expect(() => Document.createCNPJ("1234567800010")).toThrow("CNPJ must have 14 digits");
    });

    it("deve lançar erro para CNPJ com mais de 14 dígitos", () => {
      expect(() => Document.createCNPJ("123456780001000")).toThrow("CNPJ must have 14 digits");
    });

    it("deve lançar erro para CNPJ inválido (dígitos repetidos)", () => {
      expect(() => Document.createCNPJ("00000000000000")).toThrow("CNPJ invalid");
    });
  });

  describe("format", () => {
    it("deve formatar CPF", () => {
      const cpf = Document.createCPF("11144477735");
      expect(cpf.format()).toBe("111.444.777-35");
    });

    it("deve formatar CNPJ", () => {
      const cnpj = Document.createCNPJ("11222333000181");
      expect(cnpj.format()).toBe("11.222.333/0001-81");
    });
  });
});
