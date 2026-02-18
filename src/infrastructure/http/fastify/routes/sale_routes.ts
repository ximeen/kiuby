import { Permission } from "@domain/entities/user/permissions";
import { uuidParamSchema } from "@shared/validators/zod/common_validators";
import type { FastifyInstance } from "fastify";
import {
  addItemSchema,
  approveSaleSchema,
  cancelSaleSchema,
  completeSaleSchema,
  createSaleSchema,
  rejectSaleSchema,
  SaleContoller,
} from "../controllers/sale_controller";
import { authMiddleware } from "../middlewares/auth_middleware";
import { requiredPermission } from "../middlewares/permissions_middleware";

export async function saleRoutes(app: FastifyInstance) {
  const controller = new SaleContoller();

  app.post(
    "/sales",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para criar uma venda",
        body: createSaleSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.CREATE_SALE])],
    },
    controller.create.bind(controller),
  );

  app.get(
    "/sales",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para listar vendas",
      },
      preHandler: [
        authMiddleware,
        requiredPermission([Permission.CREATE_SALE, Permission.VIEW_REPORTS]),
      ],
    },
    controller.list.bind(controller),
  );

  app.get(
    "/sales/pending",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para listar vendas pendentes",
      },
      preHandler: [authMiddleware, requiredPermission([Permission.APPROVE_SALE])],
    },
    controller.listPending.bind(controller),
  );

  app.get(
    "/sales/:id",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para buscar uma venda por ID",
        params: uuidParamSchema,
      },
      preHandler: [
        authMiddleware,
        requiredPermission([Permission.CREATE_SALE, Permission.VIEW_REPORTS]),
      ],
    },
    controller.get.bind(controller),
  );

  app.post(
    "/sales/:id/submit",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para submeter venda para aprovação",
        params: uuidParamSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.CREATE_SALE])],
    },
    controller.submitForApproval.bind(controller),
  );

  app.post(
    "/sales/:id/approve",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para aprovar uma venda",
        params: uuidParamSchema,
        body: approveSaleSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.APPROVE_SALE])],
    },
    controller.approve.bind(controller),
  );

  app.post(
    "/sales/:id/reject",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para rejeitar uma venda",
        params: uuidParamSchema,
        body: rejectSaleSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.APPROVE_SALE])],
    },
    controller.reject.bind(controller),
  );

  app.post(
    "/sales/:id/complete",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para completar uma venda",
        params: uuidParamSchema,
        body: completeSaleSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.APPROVE_SALE])],
    },
    controller.complete.bind(controller),
  );

  app.post(
    "/sales/:id/cancel",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para cancelar uma venda",
        params: uuidParamSchema,
        body: cancelSaleSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.CREATE_SALE])],
    },
    controller.cancel.bind(controller),
  );

  app.post(
    "/sales/:id/items",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para adicionar item a uma venda",
        params: uuidParamSchema,
        body: addItemSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.CREATE_SALE])],
    },
    controller.addItem.bind(controller),
  );

  app.delete(
    "/sales/:id/items/:itemId",
    {
      schema: {
        tags: ["SALES"],
        description: "Rota para remover item de uma venda",
        params: uuidParamSchema,
      },
      preHandler: [authMiddleware, requiredPermission([Permission.CREATE_SALE])],
    },
    controller.removeItem.bind(controller),
  );
}
