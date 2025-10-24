import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import { NotFoundError } from "@shared/errors/domain_error";

interface GetSaleOutput {
  id: string;
  customerId: string;
  customerName: string;
  status: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: {
      type: string;
      value: number;
      amount: number;
    };
    subtotal: number;
    total: number;
  }>;
  discount: {
    type: string;
    value: number;
    amount: number;
  };
  subtotal: number;
  totalDiscount: number;
  total: number;
  paymentMethod?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GetSaleUseCase {
  constructor(private saleRepo: ISaleRepository) {}

  async execute(saleId: string): Promise<GetSaleOutput> {
    const sale = await this.saleRepo.findById(saleId);
    if (!sale) {
      throw new NotFoundError("Sale", saleId);
    }

    const subtotal = sale.getSubtotal();
    const total = sale.getTotal();

    return {
      id: sale.id,
      customerId: sale.customerId,
      customerName: sale.customerName,
      status: sale.status,
      items: sale.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity.value,
        unitPrice: item.unitPrice.amount,
        discount: {
          type: item.discount.type,
          value: item.discount.value,
          amount: item.getDiscountAmount(),
        },
        subtotal: item.getSubtotal().amount,
        total: item.getTotal().amount,
      })),
      discount: {
        type: sale.discount.type,
        value: sale.discount.value,
        amount: sale.getSaleDiscountAmount(),
      },
      subtotal: subtotal.amount,
      totalDiscount: sale.getItemsDiscount() + sale.getSaleDiscountAmount(),
      total: total.amount,
      paymentMethod: sale.paymentMethod,
      createdBy: sale.createdBy,
      approvedBy: sale.approvedBy,
      approvedAt: sale.approvedAt,
      rejectedBy: sale.rejectedBy,
      rejectedAt: sale.rejectedAt,
      rejectionReason: sale.rejectionReason,
      notes: sale.notes,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
    };
  }
}
