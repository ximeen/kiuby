import type { FiscalDocument } from "./fiscal_document_entity";
import type { FiscalDocumentItem } from "./fiscal_document_item_entity";

export interface IFiscalDocumentRepository {
  save(doc: FiscalDocument): Promise<void>;
  saveItems(docId: string, items: FiscalDocumentItem[]): Promise<void>;
  findById(id: string): Promise<FiscalDocument | null>;
  findByAccessKey(accessKey: string): Promise<FiscalDocument | null>;
  findBySale(saleId: string): Promise<FiscalDocument | null>;
  findByCustomer(customerId: string, filters?: FiscalDocumentFilters): Promise<FiscalDocument[]>;
  findBySupplier(supplierId: string, filters?: FiscalDocumentFilters): Promise<FiscalDocument[]>;
  findAll(filters?: FiscalDocumentFilters): Promise<FiscalDocument[]>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: FiscalDocumentFilters,
  ): Promise<FiscalDocument[]>;
  update(doc: FiscalDocument): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface FiscalDocumentFilters {
  type?: string;
  model?: string;
  status?: string;
  series?: number;
  number?: number;
  warehouseId?: string;
  paymentMethod?: string;
  minTotal?: number;
  maxTotal?: number;
}
