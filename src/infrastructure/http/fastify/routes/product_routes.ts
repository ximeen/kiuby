import type { FastifyInstance } from "fastify";
import { ProductController } from "../controllers/product_controller";

export async function productRoutes(app: FastifyInstance) {
  const controller = new ProductController();

  app.post("/products", controller.create.bind(controller));
  app.get("/products", controller.list.bind(controller));
  app.get("/products/:id", controller.get.bind(controller));
  app.put("/products/:id", controller.update.bind(controller));
}
