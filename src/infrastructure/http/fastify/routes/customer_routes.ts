import { Permission } from "@domain/entities/user/permissions";
import { uuidParamSchema } from "@shared/validators/zod/common_validators";
import type { FastifyInstance } from "fastify";
import {
  CustomerController,
  createCustomerSchema,
  updateCustomerSchema,
} from "../controllers/customer_controller";
import { authMiddleware } from "../middlewares/auth_middleware";
import { requiredPermission } from "../middlewares/permissions_middleware";

export async function customerRoutes(app: FastifyInstance) {
  const controller = new CustomerController();

  app.post(
    "/customers",
    {
      schema: {
        tags: ["CUSTOMERS"],
        description: "Rota para criar um cliente",
        body: createCustomerSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_CUSTOMERS])],
    },
    controller.create.bind(controller),
  );

  app.get(
    "/customers",
    {
      schema: {
        tags: ["CUSTOMERS"],
        description: "Rota para listar clientes",
      },
      preHandler: [
        authMiddleware,
        requiredPermission([Permission.MANAGE_CUSTOMERS, Permission.VIEW_REPORTS]),
      ],
    },
    controller.list.bind(controller),
  );

  app.get(
    "/customers/:id",
    {
      schema: {
        tags: ["CUSTOMERS"],
        description: "Rota para buscar um cliente por ID",
        params: uuidParamSchema,
      },
      preHandler: [
        authMiddleware,
        requiredPermission([Permission.MANAGE_CUSTOMERS, Permission.VIEW_REPORTS]),
      ],
    },
    controller.get.bind(controller),
  );

  app.put(
    "/customers/:id",
    {
      schema: {
        tags: ["CUSTOMERS"],
        description: "Rota para atualizar um cliente",
        params: uuidParamSchema,
        body: updateCustomerSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_CUSTOMERS])],
    },
    controller.update.bind(controller),
  );
}
