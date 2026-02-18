import { Permission } from "@domain/entities/user/permissions";
import type { FastifyInstance } from "fastify";
import {
  addStockSchema,
  removeStockSchema,
  StockController,
} from "../controllers/stock_controller";
import { authMiddleware } from "../middlewares/auth_middleware";
import { requiredPermission } from "../middlewares/permissions_middleware";

export async function stockRoutes(app: FastifyInstance) {
  const controller = new StockController();

  app.post(
    "/stock/add",
    {
      schema: {
        tags: ["STOCK"],
        description: "Rota para adicionar stock",
        body: addStockSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_STOCK])],
    },
    controller.addStock.bind(controller),
  );

  app.post(
    "/stock/remove",
    {
      schema: {
        tags: ["STOCK"],
        description: "Rota para remover stock",
        body: removeStockSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_STOCK])],
    },
    controller.removeStock.bind(controller),
  );

  app.get(
    "/stock/availability",
    {
      schema: {
        tags: ["STOCK"],
        description: "Rota para verificar disponibilidade de stock",
      },
      preHandler: [
        authMiddleware,
        requiredPermission([Permission.MANAGE_STOCK, Permission.VIEW_REPORTS]),
      ],
    },
    controller.checkAvailabity.bind(controller),
  );
}
