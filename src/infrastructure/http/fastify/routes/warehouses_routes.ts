import type { FastifyInstance } from "fastify";
import { WarehouseController } from "../controllers/warehouse_controller";

export async function warehousesRoutes(app: FastifyInstance) {
  const controller = new WarehouseController();

  app.post("/warehouses", controller.create.bind(controller));
  app.get("/warehouses", controller.list.bind(controller));
  app.get("/warehouses/active", controller.listActive.bind(controller));
  app.get("/warehouses/:id", controller.get.bind(controller));
}
