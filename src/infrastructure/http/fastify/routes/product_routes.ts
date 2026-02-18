import { Permission } from "@domain/entities/user/permissions";
import { uuidParamSchema } from "@shared/validators/zod/common_validators";
import type { FastifyInstance } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  createProductSchema,
  listQueryParamsSchema,
  ProductController,
  updateProductSchema,
} from "../controllers/product_controller";
import { authMiddleware } from "../middlewares/auth_middleware";
import { requiredPermission } from "../middlewares/permissions_middleware";

export const productRoutes: FastifyPluginAsyncZod = async (app: FastifyInstance) => {
  const controller = new ProductController();

  app.post(
    "/products",
    {
      schema: {
        tags: ["PRODUCTS"],
        description: "Rota para criar um produto",
        body: createProductSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_PRODUCTS])],
    },
    controller.create.bind(controller),
  );

  app.get(
    "/products",
    {
      schema: {
        tags: ["PRODUCTS"],
        description: "Rota para listar produtos",
        querystring: listQueryParamsSchema,
      },
      preHandler: [
        authMiddleware,
        requiredPermission([Permission.MANAGE_PRODUCTS, Permission.VIEW_REPORTS]),
      ],
    },
    controller.list.bind(controller),
  );

  app.get(
    "/products/:id",
    {
      schema: {
        tags: ["PRODUCTS"],
        description: "Rota para buscar um produto por ID",
        params: uuidParamSchema,
      },
      preHandler: [
        authMiddleware,
        requiredPermission([Permission.MANAGE_PRODUCTS, Permission.VIEW_REPORTS]),
      ],
    },
    controller.get.bind(controller),
  );

  app.put(
    "/products/:id",
    {
      schema: {
        tags: ["PRODUCTS"],
        description: "Rota para atualizar um produto",
        params: uuidParamSchema,
        body: updateProductSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_PRODUCTS])],
    },
    controller.update.bind(controller),
  );
};
