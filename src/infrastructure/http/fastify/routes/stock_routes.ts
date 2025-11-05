import type { FastifyInstance } from "fastify";
import { StockController } from "../controllers/stock_controller";

export async function stockRoutes(app: FastifyInstance) {
  const controller = new StockController();

  app.post("/stock/add", controller.addStock.bind(controller));
  app.post("/stock/remove", controller.removeStock.bind(controller));
  app.get("/stock/availability", controller.checkAvailabity.bind(controller));
}
