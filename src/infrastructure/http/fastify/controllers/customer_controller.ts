import { CreateCustomerUseCase } from "@application/use_cases/customer/create_customer";
import { GetCustomerUseCase } from "@application/use_cases/customer/get_customer";
import { ListCustomersUseCase } from "@application/use_cases/customer/list_customers";
import { UpdateCustomerUseCase } from "@application/use_cases/customer/update_customer";
import type { CustomerType } from "@domain/entities/customers/customer_entity";
import { HTTP_STATUS } from "@shared/constants";
import { getCustomerRepository } from "@shared/container/repositories";
import type { FastifyReply, FastifyRequest } from "fastify";
import { email, enum as enum_, iso, number, object, string } from "zod";

const createCustomerSchema = object({
  name: string().min(3),
  emai: email().optional(),
  phone: string().optional(),
  document: string().optional(),
  type: enum_(["individual", "company"]),
  companyName: string().optional(),
  birthdate: iso.datetime().optional(),
  creditLimit: number().min(0).optional(),
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

const updateCustomerSchema = object({
  name: string().min(3).optional(),
  emai: email().optional(),
  phone: string().optional(),
  document: string().optional(),
  companyName: string().optional(),
  birthdate: iso.datetime().optional(),
  creditLimit: number().min(0).optional(),
  notes: string().optional(),
  status: enum_(["active", "inactive", "blocked"]).optional(),
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

export { createCustomerSchema, updateCustomerSchema };

export class CustomerController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createCustomerSchema.parse(request.body);

    const useCase = new CreateCustomerUseCase(getCustomerRepository());
    const result = await useCase.execute({
      ...data,
      type: data.type as CustomerType,
      birthdate: data.birthdate ? new Date(data.birthdate) : undefined,
    });

    return reply.status(HTTP_STATUS.CREATED).send(result);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { status, type, searchTerm, hasDebt, hasCreditLimit } = request.query as {
      status?: string;
      type?: string;
      searchTerm?: string;
      hasDebt?: boolean;
      hasCreditLimit?: boolean;
    };

    const useCase = new ListCustomersUseCase(getCustomerRepository());
    const result = await useCase.execute({ status, type, searchTerm, hasDebt, hasCreditLimit });

    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const useCase = new GetCustomerUseCase(getCustomerRepository());
    const result = await useCase.execute(id);
    reply.status(HTTP_STATUS.OK).send(result);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = updateCustomerSchema.parse(request.body);

    const useCase = new UpdateCustomerUseCase(getCustomerRepository());
    await useCase.execute({ id, ...data });

    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
