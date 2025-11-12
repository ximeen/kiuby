import type { FastifyInstance } from "fastify";
import {
  createProductSchema,
  listQueryParamsSchema,
  ProductController,
  updateProductSchema,
} from "../controllers/product_controller";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

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
