import { CreateWarehouseUseCase } from "@application/use_cases/warehouses/create_warehouse";
import { GetWarehouseUseCase } from "@application/use_cases/warehouses/get_warehouse";
import { ListActiveWarehousesUseCase } from "@application/use_cases/warehouses/list_active_warehouses";
import { ListWarehousesUseCase } from "@application/use_cases/warehouses/list_warehouses";
import { UpdateWarehouseUseCase } from "@application/use_cases/warehouses/update_warehouse";
import type { WarehouseType } from "@domain/entities/warehouses/warehouses_entity";
import { HTTP_STATUS } from "@shared/constants";
import { getWarehouseRepository } from "@shared/container/repositories";
import type { FastifyReply, FastifyRequest } from "fastify";
import { email, enum as enum_, number, object, string, uuid } from "zod";

const createWarehouseSchema = object({
  name: string().min(3),
  code: string().min(2).max(10),
  type: enum_(["main", "branch", "store", "distribuition"]),
  phone: string().optional(),
  email: email().optional(),
  managerId: uuid().optional(),
  capacity: number().min(0).optional(),
  notes: string().optional(),
  address: object({
    street: string(),
    number: string(),
    complement: string().optional(),
    neighborhood: string(),
    city: string(),
    state: string().length(2),
    zipCode: string(),
    country: string().optional(),
  }).optional(),
});

const updateWarehouseSchema = object({
  name: string().min(3).optional(),
  phone: string().optional(),
  email: email().optional(),
  managerId: uuid().optional(),
  capacity: number().min(0).optional(),
  notes: string().optional(),
  status: enum_(["active", "inactive", "maintenance"]).optional(),
  address: object({
    street: string(),
    number: string(),
    complement: string().optional(),
    neighborhood: string(),
    city: string(),
    state: string().length(2),
    zipCode: string(),
    country: string().optional(),
  }).optional(),
});

export { createWarehouseSchema, updateWarehouseSchema };

export class WarehouseController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createWarehouseSchema.parse(request.body);

    const useCase = new CreateWarehouseUseCase(getWarehouseRepository());
    const result = await useCase.execute({
      ...data,
      type: data.type as WarehouseType,
    });

    return reply.status(HTTP_STATUS.CREATED).send(result);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { status, type, searchTerm } = request.query as {
      status?: string;
      type?: string;
      searchTerm?: string;
    };

    const useCase = new ListWarehousesUseCase(getWarehouseRepository());
    const result = await useCase.execute({ status, type, searchTerm });
    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async listActive(_request: FastifyRequest, reply: FastifyReply) {
    const useCase = new ListActiveWarehousesUseCase(getWarehouseRepository());
    const result = useCase.execute();
    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const useCase = new GetWarehouseUseCase(getWarehouseRepository());
    const result = await useCase.execute(id);
    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = updateWarehouseSchema.parse(request.body);

    const useCase = new UpdateWarehouseUseCase(getWarehouseRepository());
    await useCase.execute({ id, ...data });

    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
