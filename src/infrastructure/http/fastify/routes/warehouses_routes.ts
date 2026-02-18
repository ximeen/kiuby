import { Permission } from "@domain/entities/user/permissions";
import { uuidParamSchema } from "@shared/validators/zod/common_validators";
import type { FastifyInstance } from "fastify";
import {
  createWarehouseSchema,
  updateWarehouseSchema,
  WarehouseController,
} from "../controllers/warehouse_controller";
import { authMiddleware } from "../middlewares/auth_middleware";
import { requiredPermission } from "../middlewares/permissions_middleware";

export async function warehousesRoutes(app: FastifyInstance) {
  const controller = new WarehouseController();

  app.post(
    "/warehouses",
    {
      schema: {
        tags: ["WAREHOUSES"],
        description: "Rota para criar um armazém",
        body: createWarehouseSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_STOCK])],
    },
    controller.create.bind(controller),
  );

  app.get(
    "/warehouses",
    {
      schema: {
        tags: ["WAREHOUSES"],
        description: "Rota para listar armazéns",
      },
      preHandler: [
        authMiddleware,
        requiredPermission([Permission.MANAGE_STOCK, Permission.VIEW_REPORTS]),
      ],
    },
    controller.list.bind(controller),
  );

  app.get(
    "/warehouses/active",
    {
      schema: {
        tags: ["WAREHOUSES"],
        description: "Rota para listar armazéns ativos",
      },
      preHandler: [authMiddleware],
    },
    controller.listActive.bind(controller),
  );

  app.get(
    "/warehouses/:id",
    {
      schema: {
        tags: ["WAREHOUSES"],
        description: "Rota para buscar um armazém por ID",
        params: uuidParamSchema,
      },
      preHandler: [
        authMiddleware,
        requiredPermission([Permission.MANAGE_STOCK, Permission.VIEW_REPORTS]),
      ],
    },
    controller.get.bind(controller),
  );

  app.put(
    "/warehouses/:id",
    {
      schema: {
        tags: ["WAREHOUSES"],
        description: "Rota para atualizar um armazém",
        params: uuidParamSchema,
        body: updateWarehouseSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.MANAGE_STOCK])],
    },
    controller.update.bind(controller),
  );
}
