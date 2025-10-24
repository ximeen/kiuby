import type { ISaleRepository } from "@domain/entities/sale/sale_repository";

interface ListSalesInput {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  createdBy?: string;
  minTotal?: number;
  maxTotal?: number;
}

interface SaleListItem {
  id: string;
  customerName: string;
  status: string;
  itemsCount: number;
  total: number;
  paymentMethod?: string;
  createdBy: string;
  createdAt: Date;
}

export class ListSalesUseCase {
  constructor(private saleRepo: ISaleRepository) {}

  async execute(filters?: ListSalesInput): Promise<SaleListItem[]> {
    const sales = await this.saleRepo.findAll(filters);

    return sales.map((sale) => ({
      id: sale.id,
      customerName: sale.customerName,
      status: sale.status,
      itemsCount: sale.items.length,
      total: sale.getTotal().amount,
      paymentMethod: sale.paymentMethod,
      createdBy: sale.createdBy,
      createdAt: sale.createdAt,
    }));
  }
}
