import type { ICustomerRepository } from "@domain/entities/customers/customer_repository";
import { PaymentMethod } from "@domain/entities/sale/sale_entity";
import type { ISaleRepository } from "@domain/entities/sale/sale_repository";
import {
  MovementReason,
  MovementType,
  StockMovement,
} from "@domain/entities/stock/stock_movement.entity";
import type {
  IStockMovementRepository,
  IStockRepository,
} from "@domain/entities/stock/stock_repository";
import { Quantity } from "@domain/entities/stock/value_objects/quantity";
import { NotFoundError, ValidationError } from "@shared/errors/domain_error";

interface CompleteSaleInput {
  saleId: string;
  warehouseId: string;
}

export class CompleteSaleUseCase {
  constructor(
    private saleRepo: ISaleRepository,
    private stockRepo: IStockRepository,
    private movementRepo: IStockMovementRepository,
    private customerRepo: ICustomerRepository,
  ) {}

  async execute(input: CompleteSaleInput): Promise<void> {
    const sale = await this.saleRepo.findById(input.saleId);

    if (!sale) {
      throw new NotFoundError("Sale", input.saleId);
    }

    sale.startProcessing();
    await this.saleRepo.update(sale);

    for (const item of sale.items) {
      const stock = await this.stockRepo.findByProductAndWarehouse(
        item.productId,
        input.warehouseId,
      );

      if (!stock) {
        throw new NotFoundError(`Stock`, `${item.productId}/${input.warehouseId}`);
      }

      const quantity = Quantity.create(item.quantity.value);
      const previousQty = stock.quantity;

      stock.confirmReservation(quantity);
      await this.stockRepo.update(stock);

      const movement = StockMovement.create({
        productId: item.productId,
        stockId: stock.id,
        type: MovementType.EXIT,
        reason: MovementReason.SALE,
        quantity,
        previousQuantity: previousQty,
        newQuantity: stock.quantity,
        userId: sale.createdBy,
        referenceId: sale.id,
        referenceType: "sale",
      });

      await this.movementRepo.save(movement);
    }

    if (sale.paymentMethod === PaymentMethod.CREDIT) {
      const customer = await this.customerRepo.findById(sale.customerId);

      if (customer) {
        customer.addDebt(sale.getTotal().amount);
        await this.customerRepo.update(customer);
      }
    }

    sale.complete();
    await this.saleRepo.update(sale);
  }
}
