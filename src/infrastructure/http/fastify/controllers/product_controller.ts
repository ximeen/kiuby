import { CreateProductUseCase } from "@application/use_cases/products/create_product";
import { GetProductUseCase } from "@application/use_cases/products/get_product";
import { ListProductsUseCase } from "@application/use_cases/products/list_products";
import { UpdateProductUseCase } from "@application/use_cases/products/update_product";
import { HTTP_STATUS } from "@shared/constants";
import { getProductsRepository } from "@shared/container/repositories";
import type { FastifyReply, FastifyRequest } from "fastify";
import { number, object, string, uuid } from "zod";

const createProductSchema = object({
  name: string().min(3),
  description: string().optional(),
  sku: string().min(3),
  price: number().positive(),
  costPrice: number().positive().optional(),
  categoryId: uuid().optional(),
  minStockLevel: number().min(0),
  maxStockLevel: number().min(0).optional(),
  unit: string().default("UN"),
});

const updateProductSchema = object({
  name: string().min(3).optional(),
  description: string().optional(),
  price: number().positive().optional(),
  costPrice: number().positive().optional(),
  minStockLevel: number().min(0).optional(),
  maxStockLevel: number().min(0).optional(),
});

export class ProductController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createProductSchema.parse(request.body);
    const useCase = new CreateProductUseCase(getProductsRepository());
    const result = await useCase.execute(data);

    return reply.status(HTTP_STATUS.CREATED).send(result);
  }

  async get(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const useCase = new GetProductUseCase(getProductsRepository());
    const result = await useCase.execute(id);

    reply.status(HTTP_STATUS.OK).send(result);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const { status, categoryId, searchTerm, minPrice, maxPrice } = request.query as {
      status?: string;
      categoryId?: string;
      searchTerm?: string;
      minPrice?: string;
      maxPrice?: string;
    };
    const useCase = new ListProductsUseCase(getProductsRepository());
    const result = await useCase.execute({
      status,
      categoryId,
      searchTerm,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
    });

    return reply.status(HTTP_STATUS.OK).send(result);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const data = updateProductSchema.parse(request.body);
    const useCase = new UpdateProductUseCase(getProductsRepository());
    await useCase.execute({ id, ...data });
    return reply.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
