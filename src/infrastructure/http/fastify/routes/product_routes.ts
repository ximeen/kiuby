import type { FastifyInstance } from "fastify";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import {
  createProductSchema,
  listQueryParamsSchema,
  ProductController,
  updateProductSchema,
} from "../controllers/product_controller";
import { authMiddleware } from "../middlewares/auth_middleware";

export const productRoutes: FastifyPluginAsyncZod = async (app: FastifyInstance) => {
  const controller = new ProductController();

  app.post(
    "/products",
    {
      schema: {
        tags: ["PRODUCTS"],
        body: createProductSchema,
      },
    },
    controller.create.bind(controller),
  );
  app.get(
    "/products",
    {
      schema: {
        tags: ["PRODUCTS"],
        querystring: listQueryParamsSchema,
      },
      preHandler: [authMiddleware],
    },
    controller.list.bind(controller),
  );
  app.get(
    "/products/:id",
    {
      schema: {
        tags: ["PRODUCTS"],
      },
    },
    controller.get.bind(controller),
  );
  app.put(
    "/products/:id",
    {
      schema: {
        tags: ["PRODUCTS"],
        body: updateProductSchema,
      },
    },
    controller.update.bind(controller),
  );
};
