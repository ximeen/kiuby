import { AddStockUseCase } from "@application/use_cases/stock/add_stock";
import { CheckStockAvailabilityUseCase } from "@application/use_cases/stock/check_stock_available";
import { RemoveStockUseCase } from "@application/use_cases/stock/remove_stock";
import type { MovementReason } from "@domain/entities/stock/stock_movement.entity";
import { HTTP_STATUS } from "@shared/constants";
import { getStockMovementRepository, getStockRepository } from "@shared/container/repositories";
import type { FastifyReply, FastifyRequest } from "fastify";
import { enum as enum_, number, object, string, uuid } from "zod";

const addStockSchema = object({
  productId: uuid(),
  warehouseId: uuid(),
  quantity: number().positive(),
  userId: uuid(),
  reason: enum_(["purchase", "manual", "transfer_in", "return", "inventory"]),
  notes: string().optional(),
  referenceId: uuid().optional(),
  referenceType: string().optional(),
});

const removeStockSchema = object({
  productId: uuid(),
  warehouseId: uuid(),
  quantity: number().positive(),
  userId: uuid(),
  reason: enum_(["sale", "manual", "transfer_out", "damaged", "expired", "inventory"]),
  notes: string().optional(),
  referenceId: uuid().optional(),
  referenceType: string().optional(),
});

export class StockController {
  async addStock(request: FastifyRequest, reply: FastifyReply) {
    const data = addStockSchema.parse(request.body);
    const useCase = new AddStockUseCase(getStockRepository(), getStockMovementRepository());
    await useCase.execute({
      ...data,
      reason: data.reason as MovementReason,
    });

    return reply.status(HTTP_STATUS.CREATED).send();
  }

  async removeStock(request: FastifyRequest, reply: FastifyReply) {
    const data = removeStockSchema.parse(request.body);
    const useCase = new RemoveStockUseCase(getStockRepository(), getStockMovementRepository());
    await useCase.execute({
      ...data,
      reason: data.reason as MovementReason,
    });

    return reply.send(HTTP_STATUS.CREATED).send();
  }

  async checkAvailabity(request: FastifyRequest, reply: FastifyReply) {
    const { productId, warehouseId, requiredQuantity } = request.query as {
      productId: string;
      warehouseId: string;
      requiredQuantity: string;
    };
    const useCase = new CheckStockAvailabilityUseCase(getStockRepository());
    const result = useCase.execute({
      productId,
      warehouseId,
      requiredQuantity: Number(requiredQuantity),
    });

    return reply.status(HTTP_STATUS.OK).send(result);
  }
}
