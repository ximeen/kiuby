import type { ISaleRepository, SaleFilters } from "@domain/entities/sale/sale_repository";

interface GetSalesByCustomerInput {
  customerId: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

interface CustomerSaleItem {
  id: string;
  status: string;
  itemsCount: number;
  total: number;
  paymentMethod?: string;
  createdAt: Date;
}

export class GetSalesByCustomerUseCase {
  constructor(private saleRepo: ISaleRepository) {}

  async execute(input: GetSalesByCustomerInput): Promise<CustomerSaleItem[]> {
    const filters: SaleFilters = {
      status: input.status,
      startDate: input.startDate,
      endDate: input.endDate,
    };

    const sales = await this.saleRepo.findByCustomer(input.customerId, filters);

    return sales.map((sale) => ({
      id: sale.id,
      status: sale.status,
      itemsCount: sale.items.length,
      total: sale.getTotal().amount,
      paymentMethod: sale.paymentMethod,
      createdAt: sale.createdAt,
    }));
  }
}
