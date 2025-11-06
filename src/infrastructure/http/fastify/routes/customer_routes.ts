import type { FastifyInstance } from "fastify";
import { CustomerController } from "../controllers/customer_controller";

export async function customerRoutes(app: FastifyInstance) {
  const controller = new CustomerController();

  app.post("/customers", controller.create.bind(controller));
  app.get("/customers/:id", controller.get.bind(controller));
}
