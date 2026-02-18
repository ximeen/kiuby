import { AddItemToSaleUseCase } from "@application/use_cases/sale/add_item_to_sale";
import { ApproveSaleUseCase } from "@application/use_cases/sale/approve_sale";
import { CancelSaleUseCase } from "@application/use_cases/sale/cancel_sale";
import { CompleteSaleUseCase } from "@application/use_cases/sale/complete_sale";
import { CreateSaleUseCase } from "@application/use_cases/sale/create_sale";
import { GetSaleUseCase } from "@application/use_cases/sale/get_sale";
import { ListPendingSalesUseCase } from "@application/use_cases/sale/list_pending_sales";
import { ListSalesUseCase } from "@application/use_cases/sale/list_sales";
import { RejectSaleUseCase } from "@application/use_cases/sale/reject_sale";
import { RemoveItemFromSaleUseCase } from "@application/use_cases/sale/remove_item_from_sale";
import { SubmitForApprovalUseCase } from "@application/use_cases/sale/submit_for_approval";
import type { PaymentMethod } from "@domain/entities/sale/sale_entity";
import { HTTP_STATUS } from "@shared/constants";
import {
  getCustomerRepository,
  getProductsRepository,
  getSaleRepository,
  getStockMovementRepository,
  getStockRepository,
} from "@shared/container/repositories";
import type { FastifyReply, FastifyRequest } from "fastify";
import { array, enum as enum_, number, object, string, uuid } from "zod";

export const createSaleItemSchema = object({
  productId: uuid(),
  quantity: number().positive(),
  unitPrice: number().positive().optional(),
  discountType: enum_(["percentage", "fixed"]).optional(),
  discountValue: number().min(0).optional(),
});

export const createSaleSchema = object({
  customerId: uuid(),
  items: array(createSaleItemSchema).min(1),
  paymentMethod: enum_([
    "cash",
    "credit_card",
    "debit_card",
    "pix",
    "bank_slip",
    "credit",
  ]).optional(),
  notes: string().optional(),
  userId: uuid(),
  saleDiscountType: enum_(["percentage", "fixed"]).optional(),
  saleDiscountValue: number().min(0).optional(),
});

export const approveSaleSchema = object({
  userId: uuid(),
  warehouseId: uuid(),
});

export const rejectSaleSchema = object({
  userId: uuid(),
  reason: string().min(1),
});

export const completeSaleSchema = object({
  warehouseId: uuid(),
});

export const cancelSaleSchema = object({
  warehouseId: uuid().optional(),
});

export const addItemSchema = object({
  productId: uuid(),
  quantity: number().positive(),
  unitPrice: number().positive().optional(),
  discountType: enum_(["percentage", "fixed"]).optional(),
  discountValue: number().min(0).optional(),
});

export class SaleContoller {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createSaleSchema.parse(request.body);
    const useCase = new CreateSaleUseCase(
      getSaleRepository(),
      getCustomerRepository(),
      getProductsRepository(),
    );
    const result = useCase.execute({
      ...data,
      paymentMethod: data.paymentMethod as PaymentMethod | undefined,
    });
    return reply.status(HTTP_STATUS.CREATED).send(result);
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const useCase = new GetSaleUseCase(getSaleRepository());
    const result = await useCase.execute(id);
    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { status, startDate, endDate, createdBy, minTotal, maxTotal } = request.query as {
      status?: string;
      startDate?: string;
      endDate?: string;
      createdBy?: string;
      minTotal?: string;
      maxTotal?: string;
    };

    const useCase = new ListSalesUseCase(getSaleRepository());
    const result = await useCase.execute({
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      createdBy,
      minTotal: minTotal ? parseFloat(minTotal) : undefined,
      maxTotal: maxTotal ? parseFloat(maxTotal) : undefined,
    });

    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async listPending(_request: FastifyRequest, reply: FastifyReply) {
    const useCase = new ListPendingSalesUseCase(getSaleRepository());
    const result = await useCase.execute();
    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async approve(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = approveSaleSchema.parse(request.body);

    const useCase = new ApproveSaleUseCase(getSaleRepository(), getStockRepository());
    await useCase.execute({ saleId: id, ...data });
    return reply.send(HTTP_STATUS.NO_CONTENT).send();
  }

  async reject(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = rejectSaleSchema.parse(request.body);
    const useCase = new RejectSaleUseCase(getSaleRepository());
    await useCase.execute({ saleId: id, ...data });
    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async complete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = completeSaleSchema.parse(request.body);
    const useCase = new CompleteSaleUseCase(
      getSaleRepository(),
      getStockRepository(),
      getStockMovementRepository(),
      getCustomerRepository(),
    );
    await useCase.execute({
      saleId: id,
      ...data,
    });
    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async cancel(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = cancelSaleSchema.parse(request.body);

    const useCase = new CancelSaleUseCase(getSaleRepository(), getStockRepository());
    await useCase.execute({
      saleId: id,
      ...data,
    });

    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async submitForApproval(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const useCase = new SubmitForApprovalUseCase(getSaleRepository());
    await useCase.execute({ saleId: id });
    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async addItem(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = addItemSchema.parse(request.body);

    const useCase = new AddItemToSaleUseCase(getSaleRepository(), getProductsRepository());
    await useCase.execute({
      saleId: id,
      ...data,
    });

    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async removeItem(request: FastifyRequest, reply: FastifyReply) {
    const { id, itemId } = request.params as { id: string; itemId: string };
    const useCase = new RemoveItemFromSaleUseCase(getSaleRepository());
    await useCase.execute({
      saleId: id,
      itemId,
    });

    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
