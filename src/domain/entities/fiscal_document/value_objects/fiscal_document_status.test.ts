import { describe, expect, it } from "vitest";
import { FiscalDocumentStatus, FiscalDocumentStatusVO } from "./fiscal_document_status";

describe("FiscalDocumentStatusVO", () => {
  describe("create", () => {
    it("deve criar status com valor válido", () => {
      const status = FiscalDocumentStatusVO.create(FiscalDocumentStatus.ISSUED);
      expect(status.status).toBe(FiscalDocumentStatus.ISSUED);
    });
  });

  describe("createDraft", () => {
    it("deve criar status draft", () => {
      const status = FiscalDocumentStatusVO.createDraft();
      expect(status.status).toBe(FiscalDocumentStatus.DRAFT);
      expect(status.isDraft()).toBe(true);
    });
  });

  describe("createIssued", () => {
    it("deve criar status issued", () => {
      const status = FiscalDocumentStatusVO.createIssued();
      expect(status.status).toBe(FiscalDocumentStatus.ISSUED);
      expect(status.isIssued()).toBe(true);
    });
  });

  describe("createCancelled", () => {
    it("deve criar status cancelled com reason", () => {
      const status = FiscalDocumentStatusVO.createCancelled("Motivo do cancelamento");
      expect(status.status).toBe(FiscalDocumentStatus.CANCELLED);
      expect(status.isCancelled()).toBe(true);
      expect(status.cancellationReason).toBe("Motivo do cancelamento");
      expect(status.cancelledAt).toBeInstanceOf(Date);
    });
  });

  describe("createDenied", () => {
    it("deve criar status denied com reason", () => {
      const status = FiscalDocumentStatusVO.createDenied("Motivo da negação");
      expect(status.status).toBe(FiscalDocumentStatus.DENIED);
      expect(status.isDenied()).toBe(true);
      expect(status.denialReason).toBe("Motivo da negação");
      expect(status.deniedAt).toBeInstanceOf(Date);
    });
  });

  describe("isDraft", () => {
    it("deve retornar true para draft", () => {
      const status = FiscalDocumentStatusVO.createDraft();
      expect(status.isDraft()).toBe(true);
    });

    it("deve retornar false para não draft", () => {
      const status = FiscalDocumentStatusVO.createIssued();
      expect(status.isDraft()).toBe(false);
    });
  });

  describe("isIssued", () => {
    it("deve retornar true para issued", () => {
      const status = FiscalDocumentStatusVO.createIssued();
      expect(status.isIssued()).toBe(true);
    });
  });

  describe("isCancelled", () => {
    it("deve retornar true para cancelled", () => {
      const status = FiscalDocumentStatusVO.createCancelled("motivo");
      expect(status.isCancelled()).toBe(true);
    });
  });

  describe("isDenied", () => {
    it("deve retornar true para denied", () => {
      const status = FiscalDocumentStatusVO.createDenied("motivo");
      expect(status.isDenied()).toBe(true);
    });
  });

  describe("canCancel", () => {
    it("deve retornar true para issued", () => {
      const status = FiscalDocumentStatusVO.createIssued();
      expect(status.canCancel()).toBe(true);
    });

    it("deve retornar false para draft", () => {
      const status = FiscalDocumentStatusVO.createDraft();
      expect(status.canCancel()).toBe(false);
    });
  });

  describe("canEdit", () => {
    it("deve retornar true para draft", () => {
      const status = FiscalDocumentStatusVO.createDraft();
      expect(status.canEdit()).toBe(true);
    });

    it("deve retornar false para issued", () => {
      const status = FiscalDocumentStatusVO.createIssued();
      expect(status.canEdit()).toBe(false);
    });
  });
});
