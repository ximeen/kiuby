import type { FastifyInstance } from "fastify";
import { SaleContoller } from "../controllers/sale_controller";

export async function saleRoutes(app: FastifyInstance) {
  const controller = new SaleContoller();

  app.post("/sales", controller.create.bind(controller));
  app.get("/sales", controller.list.bind(controller));
  app.get("/sales/pending", controller.listPending.bind(controller));
  app.get("/sales/:id", controller.get.bind(controller));

  app.post("/sales/:id/submit", controller.submitForApproval.bind(controller));
  app.post("/sales/:id/approve", controller.approve.bind(controller));
  app.post("/sales/:id/reject", controller.reject.bind(controller));
  app.post("/sales/:id/complete", controller.complete.bind(controller));
  app.post("/sales/:id/cancel", controller.cancel.bind(controller));

  app.post("/sales/:id/items", controller.addItem.bind(controller));
  app.delete("/sales/:id/items/:itemId", controller.removeItem.bind(controller));
}
