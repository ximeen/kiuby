import { describe, expect, it } from "vitest";
import {
  FiscalDocumentModel,
  FiscalDocumentType,
  FiscalDocumentTypeVO,
} from "./fiscal_document_type";

describe("FiscalDocumentTypeVO", () => {
  describe("create", () => {
    it("deve criar tipo de documento fiscal", () => {
      const docType = FiscalDocumentTypeVO.create(
        FiscalDocumentType.INPUT,
        FiscalDocumentModel.NFE,
      );
      expect(docType.type).toBe(FiscalDocumentType.INPUT);
      expect(docType.model).toBe(FiscalDocumentModel.NFE);
    });
  });

  describe("createInputNfe", () => {
    it("deve criar tipo NFe de entrada", () => {
      const docType = FiscalDocumentTypeVO.createInputNfe();
      expect(docType.type).toBe(FiscalDocumentType.INPUT);
      expect(docType.model).toBe(FiscalDocumentModel.NFE);
      expect(docType.isInput()).toBe(true);
      expect(docType.isNfe()).toBe(true);
    });
  });

  describe("createInputNfce", () => {
    it("deve criar tipo NFCe de entrada", () => {
      const docType = FiscalDocumentTypeVO.createInputNfce();
      expect(docType.type).toBe(FiscalDocumentType.INPUT);
      expect(docType.model).toBe(FiscalDocumentModel.NFCE);
      expect(docType.isInput()).toBe(true);
      expect(docType.isNfce()).toBe(true);
    });
  });

  describe("createInputNfs", () => {
    it("deve criar tipo NFS de entrada", () => {
      const docType = FiscalDocumentTypeVO.createInputNfs();
      expect(docType.type).toBe(FiscalDocumentType.INPUT);
      expect(docType.model).toBe(FiscalDocumentModel.NFS);
      expect(docType.isInput()).toBe(true);
      expect(docType.isNfs()).toBe(true);
    });
  });

  describe("createOutputNfe", () => {
    it("deve criar tipo NFe de saída", () => {
      const docType = FiscalDocumentTypeVO.createOutputNfe();
      expect(docType.type).toBe(FiscalDocumentType.OUTPUT);
      expect(docType.model).toBe(FiscalDocumentModel.NFE);
      expect(docType.isOutput()).toBe(true);
      expect(docType.isNfe()).toBe(true);
    });
  });

  describe("createOutputNfce", () => {
    it("deve criar tipo NFCe de saída", () => {
      const docType = FiscalDocumentTypeVO.createOutputNfce();
      expect(docType.type).toBe(FiscalDocumentType.OUTPUT);
      expect(docType.model).toBe(FiscalDocumentModel.NFCE);
      expect(docType.isOutput()).toBe(true);
      expect(docType.isNfce()).toBe(true);
    });
  });

  describe("createOutputNfs", () => {
    it("deve criar tipo NFS de saída", () => {
      const docType = FiscalDocumentTypeVO.createOutputNfs();
      expect(docType.type).toBe(FiscalDocumentType.OUTPUT);
      expect(docType.model).toBe(FiscalDocumentModel.NFS);
      expect(docType.isOutput()).toBe(true);
      expect(docType.isNfs()).toBe(true);
    });
  });

  describe("isInput", () => {
    it("deve retornar true para input", () => {
      const docType = FiscalDocumentTypeVO.createInputNfe();
      expect(docType.isInput()).toBe(true);
    });

    it("deve retornar false para output", () => {
      const docType = FiscalDocumentTypeVO.createOutputNfe();
      expect(docType.isInput()).toBe(false);
    });
  });

  describe("isOutput", () => {
    it("deve retornar true para output", () => {
      const docType = FiscalDocumentTypeVO.createOutputNfe();
      expect(docType.isOutput()).toBe(true);
    });

    it("deve retornar false para input", () => {
      const docType = FiscalDocumentTypeVO.createInputNfe();
      expect(docType.isOutput()).toBe(false);
    });
  });

  describe("isNfe", () => {
    it("deve retornar true para NFe", () => {
      const docType = FiscalDocumentTypeVO.createInputNfe();
      expect(docType.isNfe()).toBe(true);
    });

    it("deve retornar false para NFCe", () => {
      const docType = FiscalDocumentTypeVO.createInputNfce();
      expect(docType.isNfe()).toBe(false);
    });
  });

  describe("isNfce", () => {
    it("deve retornar true para NFCe", () => {
      const docType = FiscalDocumentTypeVO.createInputNfce();
      expect(docType.isNfce()).toBe(true);
    });

    it("deve retornar false para NFe", () => {
      const docType = FiscalDocumentTypeVO.createInputNfe();
      expect(docType.isNfce()).toBe(false);
    });
  });

  describe("isNfs", () => {
    it("deve retornar true para NFS", () => {
      const docType = FiscalDocumentTypeVO.createInputNfs();
      expect(docType.isNfs()).toBe(true);
    });

    it("deve retornar false para NFe", () => {
      const docType = FiscalDocumentTypeVO.createInputNfe();
      expect(docType.isNfs()).toBe(false);
    });
  });
});
