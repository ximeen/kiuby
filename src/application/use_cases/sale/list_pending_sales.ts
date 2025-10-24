import type { ISaleRepository } from "@domain/entities/sale/sale_repository";

interface PendingSaleItem {
  id: string;
  customerName: string;
  itemsCount: number;
  total: number;
  createdBy: string;
  createdAt: Date;
}

export class ListPendingSalesUseCase {
  constructor(private saleRepo: ISaleRepository) {}

  async execute(): Promise<PendingSaleItem[]> {
    const sales = await this.saleRepo.findPendingAproval();

    return sales.map((sale) => ({
      id: sale.id,
      customerName: sale.customerName,
      itemsCount: sale.items.length,
      total: sale.getTotal().amount,
      createdBy: sale.createdBy,
      createdAt: sale.createdAt,
    }));
  }
}
