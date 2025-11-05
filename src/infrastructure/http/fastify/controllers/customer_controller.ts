import { CreateCustomerUseCase } from "@application/use_cases/customer/create_customer";
import { GetCustomerUseCase } from "@application/use_cases/customer/get_customer";
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

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const useCase = new GetCustomerUseCase(getCustomerRepository());
    const result = await useCase.execute(id);
    reply.status(HTTP_STATUS.OK).send(result);
  }
}
